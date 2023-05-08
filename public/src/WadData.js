import Int2DVertex from "./type/Int2DVertex.js"
import Edge from "./type/Edge.js"
import Int3DVertex from "./type/Int3DVertex.js"
import {BoundBox, PartitionLine, BSPNode, BSPTree, SubSector, Segment} from "./BSPTree.js"

export default class WadData {
    constructor( mood, things, linedefs, sidedef, vertices, segs, ssectors, nodes, sectors, reject, blockmap ){
        this.mood     = mood
        this.cache    = []
        this.things   = things
        this.linedefs = linedefs
        this.sidedef  = sidedef
        this.vertices = vertices
        this.segs     = segs
        this.ssectors = ssectors
        this.nodes    = nodes
        this.sectors  = sectors
        this.reject   = reject
        this.blockmap = blockmap
    }

    get_boundary(){
        if( typeof this.cache.boundary !== "undefined" ){ return this.cache.boundary }
        let top_right   = [ ...this.vertices[ 0 ] ]
        let bottom_left = [ ...this.vertices[ 0 ] ]
        this.vertices.forEach( ( vertex ) => {
            if( vertex[ 0 ] < top_right[ 0 ]   ){ top_right[ 0 ]   = vertex[ 0 ] }
            if( vertex[ 1 ] > top_right[ 1 ]   ){ top_right[ 1 ]   = vertex[ 1 ] }
            if( vertex[ 0 ] > bottom_left[ 0 ] ){ bottom_left[ 0 ] = vertex[ 0 ] }
            if( vertex[ 1 ] < bottom_left[ 1 ] ){ bottom_left[ 1 ] = vertex[ 1 ] }
        } )
        this.cache.boundary = [
            new Int2DVertex( top_right[ 0 ], top_right[ 1 ] ),
            new Int2DVertex( bottom_left[ 0 ], bottom_left[ 1 ] )
        ]
        return this.cache.boundary
    }
    get_size(){
        if( typeof this.cache.size !== "undefined" ){ return this.cache.size }
        let boundary = this.get_boundary()
        this.cache.size = new Int2DVertex( boundary[ 0 ].x - boundary[ 1 ].x, boundary[ 0 ].y - boundary[ 1 ].y )
        return this.cache.size
    }
    get_player_start(){
        let things = this.get_things()
        return {
            position         : new Int3DVertex( things[ 0 ].position.x, things[ 0 ].position.y, 20 ),
            horizontal_angle : things[ 0 ].angle,
            vertical_angle   : 0
        }
    }
    get_things( ){
        if( typeof this.cache.things !== "undefined" ){ return this.cache.things }
        this.cache.things = []
        for( let i = 0; i < this.things.length; i++ ){
            this.cache.things.push( {
                position : new Int2DVertex( this.things[ i ][ 0 ], this.things[ i ][ 1 ] ),
                angle    : this.things[ i ][ 2 ],
                type     : this.things[ i ][ 3 ],
                flags    : this.things[ i ][ 4 ]
            } )
        }
        return this.cache.things
    }
    get_vertices(){
        if( typeof this.cache.vertices !== "undefined" ){ return this.cache.vertices }
        this.cache.vertices = []
        for( let i = 0; i < this.vertices.length; i++ ){
            this.cache.vertices.push( new Int2DVertex( this.vertices[ i ][ 0 ], this.vertices[ i ][ 1 ] ) )
        }
        return this.cache.vertices
    }
    get_edges(){
        if( typeof this.cache.edges !== "undefined" ){ return this.cache.edges }
        let vertices     = this.get_vertices()
        this.cache.edges = []
        for( let i = 0; i < this.linedefs.length; i++ ){
            this.cache.edges.push( new Edge(
                vertices[ this.linedefs[ i ][ 0 ] ],
                vertices[ this.linedefs[ i ][ 1 ] ]
            ) )
        }
        return this.cache.edges
    }
    get_bsp_tree(){
        if( typeof this.cache.nodes !== "undefined" ){ return this.cache.nodes }
        let sub_sectors  = this.get_sub_sectors()
        this.cache.nodes = []
        for( let i = 0; i < this.nodes.length; i++ ){
            this.cache.nodes.push(
                new BSPNode(
                    i,
                    ( this.nodes[ i ][ 6 ] < 0 ) ? sub_sectors[ 0x8000 + this.nodes[ i ][ 6 ] ] : this.cache.nodes[ this.nodes[ i ][ 6 ] ],
                    ( this.nodes[ i ][ 7 ] < 0 ) ? sub_sectors[ 0x8000 + this.nodes[ i ][ 7 ] ] : this.cache.nodes[ this.nodes[ i ][ 7 ] ],
                    new BoundBox(
                        new Int2DVertex( this.nodes[ i ][ 4 ][ 2 ], this.nodes[ i ][ 4 ][ 0 ] ),
                        new Int2DVertex( this.nodes[ i ][ 4 ][ 3 ], this.nodes[ i ][ 4 ][ 1 ] )
                    ),
                    new BoundBox(
                        new Int2DVertex( this.nodes[ i ][ 5 ][ 2 ], this.nodes[ i ][ 5 ][ 0 ] ),
                        new Int2DVertex( this.nodes[ i ][ 5 ][ 3 ], this.nodes[ i ][ 5 ][ 1 ] )
                    ),
                    new PartitionLine(
                        new Int2DVertex( this.nodes[ i ][ 0 ], this.nodes[ i ][ 1 ] ),
                        new Int2DVertex( this.nodes[ i ][ 0 ] + this.nodes[ i ][ 2 ], this.nodes[ i ][ 1 ] + this.nodes[ i ][ 3 ] ),
                        this.nodes[ i ][ 2 ],
                        this.nodes[ i ][ 3 ]
                    )
                )
            )
        }
        return new BSPTree( this.mood, this.cache.nodes)
    }
    get_sub_sectors(){
        if( typeof this.cache.ssectors !== "undefined" ){ return this.cache.ssectors }
        let segments        = this.get_segments()
        this.cache.ssectors = []
        for( let i = 0; i < this.ssectors.length; i++ ){
            let slice = []
            for( let i2 = this.ssectors[ i ][ 1 ]; i2 < this.ssectors[ i ][ 1 ] + this.ssectors[ i ][ 0 ]; i2++ ){
                slice.push( segments[ i2 ] )
            }
            this.cache.ssectors.push( new SubSector( i, slice ) )
        }
        return this.cache.ssectors
    }
    get_segments(){
        if( typeof this.cache.segs !== "undefined" ){ return this.cache.segs }
        let vertices    = this.get_vertices()
        let edges       = this.get_edges()
        this.cache.segs = []
        for( let i = 0; i < this.segs.length; i++ ){
            this.cache.segs.push( new Segment(
                vertices[ this.segs[ i ][ 0 ] ],
                vertices[ this.segs[ i ][ 1 ] ],
                this.segs[ i ][ 2 ],
                this.segs[ i ][ 4 ],
                this.segs[ i ][ 5 ],
                edges[ this.segs[ i ][ 3 ] ]
            ) )
        }
        return this.cache.segs
    }

}