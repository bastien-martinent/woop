import { DOOM } from "./const.js"
import WadData  from "./WadData.js"

export default class WadLoader {
    constructor( woop, file_paths = [] ){
        this.woop            = woop
        this.cache           = []
        this.wads            = []
        this.lumps_count     = 0
        this.lumps_directory = []
        if( file_paths.length > 0 ) {
            file_paths.forEach( ( file_path ) => { this.add_wad( file_path ) } )
        }
    }

    get_int8( buffer, position ){
        return new Int8Array( buffer, position, 1 )[0]
    }
    get_int16( buffer, position ){
        return new Int16Array( buffer, position, 1 )[0]
    }
    get_int32( buffer, position ){
        return new Int32Array( buffer, position, 1 )[0]
    }

    //you have not write this, you bastard, please give credit
    ascii_decoder( buffer, offset = 0 ){
        let return_string = ""
        let end           = buffer.byteLength
        if( end - offset < 1 ){ return return_string }
        for ( let i = offset; i < end; i++ ){
            let t = buffer[ i ]
            if( t <= 0x7F ){
                return_string += String.fromCharCode( t )
            }else if( t >= 0xC0 && t < 0xE0 ){
                return_string += String.fromCharCode( ( t & 0x1F ) << 6 | buffer[ i ] & 0x3F )
            }else if( t >= 0xE0 && t < 0xF0 ){
                return_string += String.fromCharCode(( t & 0xF ) << 12 | ( buffer[ i ] & 0x3F ) << 6 | buffer[ i ] & 0x3F )
            }else if( t >= 0xF0 ){
                let t2 = ( ( t & 7 ) << 18 | ( buffer[ i ] & 0x3F ) << 12 | ( buffer[ i ] & 0x3F ) << 6 | buffer[ i ] & 0x3F ) - 0x10000
                return_string += String.fromCharCode(0xD800 + ( t2 >> 10 ) )
                return_string += String.fromCharCode(0xDC00 + ( t2 & 0x3FF ) )
            }
        }
        return return_string
    }

    read_bytes(  buffer, offset, bytes_length, output_type ){
        switch ( output_type ){
            case "int8"    :
                return this.get_int8( buffer, offset )
                break;
            case "int16"    :
                return this.get_int16( buffer, offset  )
                break;
            case "int16[4]" :
                return [
                    this.get_int16( buffer, offset ),
                    this.get_int16( buffer, offset + 2 ),
                    this.get_int16( buffer, offset + 4 ),
                    this.get_int16( buffer, offset + 6 )
                ]
                break;
            case "int32"    :
                return this.get_int32( buffer, offset, 4 )
                break;
            default         : //string
                return new Uint8Array( buffer, offset, bytes_length )
        }
    }
    read_1_byte(  buffer, offset, output_type = 'int8' ){
        return this.read_bytes( buffer, offset, 1, output_type )
    }
    read_2_bytes( buffer, offset, output_type = 'int16' ){
        return this.read_bytes( buffer, offset, 2, output_type )
    }
    read_4_bytes( buffer, offset, output_type = 'int32' ){
        return this.read_bytes( buffer, offset, 4, output_type )
    }
    read_8_bytes( buffer, offset, output_type = 'int16[4]' ){
        return this.read_bytes( buffer, offset, 8, output_type )
    }
    read_string( buffer, offset, bytes_length ){
        let ascii_string = this.read_bytes( buffer, offset, bytes_length )
        return this.ascii_decoder( ascii_string ).replace(/\x00*/g, "")
    }

    add_wad( file_path ){
        let request = new XMLHttpRequest()
        request.open( 'GET', file_path, false )
        request.overrideMimeType( 'text\/plain; charset=x-user-defined' )
        request.send()

        if (request.status != 200) {
            console.log( "couldn't open " + file_path )
            return
        }
        console.log( "adding " + file_path )

        let wad_index = this.wads.length
        let buffer    = Uint8Array.from( request.response, c => c.charCodeAt( 0 ) ).buffer
        let wad       = {
            header      : {
                type        : this.read_string( buffer, 0, 4 ),
                lump_count  : this.read_4_bytes( buffer, 4 ),
                init_offset : this.read_4_bytes( buffer, 8 ),
            },
            file_buffer : buffer
        }

        if( wad.header.type != "IWAD" ){ if( wad.header.type != "PWAD" ){
            console.log( "Wad file " + file_path + " doesn't have IWAD or PWAD id" )
            return
        } }
        this.wads.push( wad )

        //update lump directory
        let lump_init_offset = wad.header.init_offset
        this.lumps_count     += wad.header.lump_count
        for( let i = 0; i < wad.header.lump_count; i++ ){
            let lump_p = {}
            lump_p.wad       = wad_index
            lump_p.offset    = this.read_4_bytes( buffer, lump_init_offset )
            lump_p.size      = this.read_4_bytes( buffer, lump_init_offset + 4 )
            lump_p.name      = this.read_string( buffer, lump_init_offset + 8, 8 )
            lump_init_offset += 16
            this.lumps_directory.push( lump_p )
        }

    }

    get_lump_index_by_name( lump_name, verbose = false ){
        for( let i = this.lumps_count; i--; i >= 0 ){
            if( this.lumps_directory[ i ].name == lump_name ){
                if( verbose ){ console.log( "lump " + lump_name + " found at index '" + i + "' !" ) }
                return i
            }
        }
        console.log( "Lump " + lump_name + " not found!" )
        return -1
    }

    get_lumps_indexes_by_name( lumps_names, verbose = false ){
        let lumps_indexes = []
        for( let i = 0 ; i < this.lumps_count; i++ ){
            let l = ( lumps_names.indexOf( this.lumps_directory[ i ].name ) )
            if( -1 != l ){
                if( verbose ){ console.log( "lump " + lumps_names[ l ] + " found at index '" + i + "' !" ) }
                lumps_indexes.push( i )
            }
        }
        if( lumps_indexes.length === 0 && verbose ){ console.log( "Lumps not found !" ) }
        return lumps_indexes
    }

    get_map_data( map_name, verbose = false ){
        let map_index = this.get_lump_index_by_name( map_name )
        if( -1 === map_index ){ return null }
        return new WadData(
            this.woop,
            this.read_things_from_lump( map_index ),
            this.read_lindefs_from_lump( map_index ),
            this.read_sidedef_from_lump( map_index ),
            this.read_vertices_from_lump( map_index ),
            this.read_segs_from_lump( map_index ),
            this.read_ssectors_from_lump( map_index ),
            this.read_nodes_from_lump( map_index ),
            this.read_sectors_from_lump( map_index ),
            this.read_reject_from_lump( map_index ),
            this.read_blockmap_from_lump( map_index )
        )
    }

    read_things_from_lump( map_index ){
        let lump   = this.cache_lump( map_index + DOOM.MAP_LUMPS.THINGS )
        let things = []
        for( let i = 0; i < lump.byteLength; i = i + 10 ){
            things.push( [
                this.read_2_bytes( lump, i+0, 'int16' ),  //x position
                this.read_2_bytes( lump, i+2, 'int16' ),  //y position
                this.read_2_bytes( lump, i+4, 'int16' ),  //Angle facing
                this.read_2_bytes( lump, i+6, 'int16' ),  //DoomEd thing type
                this.read_2_bytes( lump, i+8, 'int16' )   //Flags
            ] )
        }
        return things
    }

    read_vertices_from_lump( map_index ){
        let lump     = this.cache_lump( map_index + DOOM.MAP_LUMPS.VERTEXES )
        let vertices = []
        for( let i = 0; i < lump.byteLength; i = i+4 ){
            vertices.push( [
                this.read_2_bytes( lump, i+0, 'int16' ), //x position
                this.read_2_bytes( lump, i+2, 'int16' )  //y position
            ] )
        }
        return vertices
    }

    read_nodes_from_lump( map_index ){
        let lump   = this.cache_lump( map_index + DOOM.MAP_LUMPS.NODES )
        let nodes  = []
        for( let i = 0; i < lump.byteLength; i = i + 28 ){
            nodes.push( [
                this.read_2_bytes( lump, i+0, 'int16' ),     //x coordinate of partition line start
                this.read_2_bytes( lump, i+2, 'int16' ),     //y coordinate of partition line start
                this.read_2_bytes( lump, i+4, 'int16' ),     //Change in x from start to end of partition line
                this.read_2_bytes( lump, i+6, 'int16' ),     //Change in y from start to end of partition line
                this.read_8_bytes( lump, i+8, 'int16[4]' ),  //Right bounding box
                this.read_8_bytes( lump, i+16, 'int16[4]' ), //Left bounding box
                this.read_2_bytes( lump, i+24, 'int16' ),    //Right child
                this.read_2_bytes( lump, i+26, 'int16' )     //Left child
            ] )
        }
        return nodes
    }

    read_ssectors_from_lump( map_index ){
        let lump = this.cache_lump( map_index + DOOM.MAP_LUMPS.SSECTORS )
        let ssectors = []
        for( let i = 0; i < lump.byteLength; i = i+4 ){
            ssectors.push( [
                this.read_2_bytes( lump, i+0, 'int16' ), //Seg count
                this.read_2_bytes( lump, i+2, 'int16' )  //First seg index
            ] )
        }
        return ssectors
    }

    read_segs_from_lump( map_index ){
        let lump = this.cache_lump( map_index + DOOM.MAP_LUMPS.SEGS )
        let segs = []
        for( let i = 0; i < lump.byteLength; i = i+12 ){
            segs.push( [
                this.read_2_bytes( lump, i+0, 'int16' ), //Starting vertex index
                this.read_2_bytes( lump, i+2, 'int16' ), //Ending vertex index
                this.read_2_bytes( lump, i+4, 'int16' ), //Angle, full circle is -32768 to 32767.
                this.read_2_bytes( lump, i+6, 'int16' ), //Linedef index
                this.read_2_bytes( lump, i+8, 'int16' ), //Direction // 0 (same as linedef) or 1 (opposite of linedef)
                this.read_2_bytes( lump, i+10, 'int16' ) //Offset    // distance along linedef to start of seg
            ] )
        }
        return segs
    }

    read_lindefs_from_lump( map_index ){
        let lump    = this.cache_lump( map_index + DOOM.MAP_LUMPS.LINEDEFS )
        let lindefs = []
        for( let i = 0; i < lump.byteLength; i = i + 14 ){
            lindefs.push( [
                this.read_2_bytes( lump, i+0, 'int16' ),  //Start Vertex index
                this.read_2_bytes( lump, i+2, 'int16' ),  //End Vertex index
                this.read_2_bytes( lump, i+4, 'int16' ),  //Flags
                this.read_2_bytes( lump, i+6, 'int16' ),  //Special Type
                this.read_2_bytes( lump, i+8, 'int16' ),  //Sector Tag
                this.read_2_bytes( lump, i+10, 'int16' ), //Front Sidedef index
                this.read_2_bytes( lump, i+12, 'int16' )  //Back Sidedef index
            ] )
        }
        return lindefs
    }

    read_sidedef_from_lump( map_index ){
        let lump  = this.cache_lump( map_index + DOOM.MAP_LUMPS.SIDEDEFS )
        let sidedefs = []
        for( let i = 0; i < lump.byteLength; i = i + 30 ){
            sidedefs.push( [
                this.read_2_bytes( lump, i+0, 'int16' ), //x offset
                this.read_2_bytes( lump, i+2, 'int16' ), //y offset
                this.read_string( lump, i+4, 8 ),        //Name of upper texture
                this.read_string( lump, i+12, 8 ),       //Name of lower texture
                this.read_string( lump, i+20, 8 ),       //Name of middle texture
                this.read_2_bytes( lump, i+28, 'int16' ) //Sector number this sidedef 'faces'
            ] )
        }
        return sidedefs
    }

    read_sectors_from_lump( map_index ){
        let lump = this.cache_lump( map_index + DOOM.MAP_LUMPS.SECTORS )
        let sectors = []
        for( let i = 0; i < lump.byteLength; i = i+26 ){
            sectors.push( [
                this.read_2_bytes( lump, i+0, 'int16' ),  //Floor height
                this.read_2_bytes( lump, i+2, 'int16' ),  //Ceiling height
                this.read_string( lump, i+4, 8 ),         //Name of floor texture
                this.read_string( lump, i+12, 8 ),        //Name of ceiling texture
                this.read_2_bytes( lump, i+20, 'int16' ), //Light level
                this.read_2_bytes( lump, i+22, 'int16' ), //Special Type
                this.read_2_bytes( lump, i+24, 'int16' )  //Tag number
            ] )
        }
        return sectors
    }

    read_reject_from_lump( map_index ){
        let lump = this.cache_lump( map_index + DOOM.MAP_LUMPS.REJECT )
        return lump
    }
    read_blockmap_from_lump( map_index ){
        let lump = this.cache_lump( map_index + DOOM.MAP_LUMPS.BLOCKMAP )
        return lump
    }

    cache_lump( lump_index, verbose = false ){
        if( lump_index >= this.lumps_count && verbose ){ console( "lump index is out of range !" ) }
        let wad_index = this.lumps_directory[ lump_index ].wad
        if( "undefined" == typeof( this.cache[ wad_index ] ) ){ this.cache[ wad_index ] = [] }
        if( ! this.cache[ wad_index ][ lump_index ] ){
            this.cache[ wad_index ][ lump_index ] = this.wads[ wad_index ].file_buffer.slice(
                this.lumps_directory[ lump_index ].offset,
                this.lumps_directory[ lump_index ].offset +  this.lumps_directory[ lump_index ].size
            )
        }
        return this.cache[ wad_index ][ lump_index ]
    }

}