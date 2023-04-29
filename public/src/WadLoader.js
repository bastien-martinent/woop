import Int2DVertex from "./data_type/Int2DVertex.js"

export default class WadLoader {
    constructor( file_paths = [] ){
        this.MAP_LUMPS = {
            'THINGS'   : 1,
            'LINEDEFS' : 2,
            'SIDEDEFS' : 3,
            'VERTEXES' : 4,
            'SEGS'     : 5,
            'SSECTORS' : 6,
            'NODES'    : 7,
            'SECTORS'  : 8,
            'REJECT'   : 9,
            'BLOCKMAP' : 10,
        }
        this.decoder         = new TextDecoder()
        this.endianness      = this.check_endianness()
        this.cache           = []
        this.wads            = []
        this.lumps_count     = 0
        this.lumps_directory = []
        if( file_paths.length > 0 ) {
            file_paths.forEach( ( file_path ) => { this.add_wad( file_path ) } )
        }
    }

    check_endianness() {
        let array8  = new Uint8Array( [ 0x00, 0x01 ] )
        let array16 = new Uint16Array( array8.buffer )
        switch( array16[0] ){
            case 0x0001:
                return "big"
            case 0x0100:
                return "little"
        }
    }

    get_int32( buffer, position, bytes, endian ){
        try {
            return this.CorrectInt16Endianness( new Int32Array( buffer, position, 1 )[0], endian )
        }catch( e ){
            return this.CorrectInt16Endianness( new Int32Array( buffer.slice( position, position + bytes ), 0, 1 )[0], endian )
        }
    }

    CorrectInt16Endianness( value, endian ){
        if( endian == this.endianness ){ return value }
        if( value > 32767 || value < -32768 ){ throw new Error( "Value out of bound" ) }
        let r = value
        if( r < 0 ){ r += 65536 }
        r = this.CorrectUint16Endianness( value, endian )
        if( r > 32767 ){ r -= 65536 }
        return r
    }

    CorrectUint16Endianness( value, endian ){
        if( endian == this.endianness ){ return value }
        if( value > 0xFFFF || value < 0x0000){ throw new Error( "Value out of bound" ) }
        return ( ( value & 0xFF ) << 8 ) | ( ( value >> 8 ) & 0xFF )
    }

    //keep it in case
    vanilla_decoder( buffer ){
        return this.decoder.decode( buffer )
    }

    //faster but may not work properly
    ascii_decoder( buffer, offset = 0 ){
        let return_string = ""
        let end = buffer.byteLength
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
            case "int32" : return this.get_int32( buffer, offset, bytes_length,"little" ); break;
            default      : return new Uint8Array( buffer, offset, bytes_length ); break;
        }
    }
    read_1_byte(  buffer, offset, output_type = 'int32' ){
        return this.read_bytes( buffer, offset, 1, output_type )
    }
    read_2_bytes( buffer, offset, output_type = 'int32' ){
        return this.read_bytes( buffer, offset, 2, output_type )
    }
    read_4_bytes( buffer, offset, output_type = 'int32' ){
        return this.read_bytes( buffer, offset, 4, output_type )
    }

    read_string( buffer, offset, bytes_length ){
        let ascii_string = this.read_bytes( buffer, offset, bytes_length )
        return this.ascii_decoder( ascii_string ).replace(/\x00*/g, "")
    }

    get_file_base_name( file_path ){
        let base_name = file_path.toString().match(/.*\/(.+?)\./)[1].toUpperCase();
        if( base_name.length > 8 ){
            console.log( "Filename base of " + file_path + " >8 chars" )
        }
        return base_name
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
        let map_data = {
            THINGS   : {},
            LINEDEFS : {},
            SIDEDEFS : {},
            vertexes : this.read_4_bytes_vertexes_from_lump( map_index + this.MAP_LUMPS.VERTEXES ),
            SEGS     : {},
            SSECTORS : {},
            NODES    : {},
            SECTORS  : {},
            REJECT   : {},
            BLOCKMAP : {}
        }
        return map_data
    }


    read_4_bytes_vertexes_from_lump( lump_index ){
        let lump = this.cache_lump( lump_index )
        let raw = new Int16Array( lump )
        let vertexes = []
        for( let i = 0; i < raw.length; i = i+2 ){
            vertexes.push( new Int2DVertex( raw[ i ], raw[ i+1 ] ) )
        }
        return vertexes
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