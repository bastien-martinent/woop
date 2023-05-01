import Int2DVertex from "./type/Int2DVertex.js"

export default class WadData {
    constructor( vertexes, edges ){
        this.THINGS = {}
        this.edges        = edges
        this.SIDEDEFS     = {}
        this.vertexes     = vertexes
        this.SEGS         = {}
        this.SSECTORS     = {}
        this.NODES        = {}
        this.SECTORS      = {}
        this.REJECT       = {}
        this.BLOCKMAP     = {}
    }
    get_boundary(){
            let top_right   = this.vertexes[ 0 ].clone()
            let bottom_left = this.vertexes[ 0 ].clone()
            this.vertexes.forEach( ( vertex ) => {
                if( vertex.x > top_right.x ){ top_right.set_x( vertex.x ) }
                if( vertex.y > top_right.y ){ top_right.set_y( vertex.y ) }
                if( vertex.x < bottom_left.x ){ bottom_left.set_x( vertex.x ) }
                if( vertex.y < bottom_left.y ){ bottom_left.set_y( vertex.y ) }
            } )
            return [ top_right, bottom_left ]
        }
    get_size (){
        let boundary = this.get_boundary()
        return new Int2DVertex( boundary[ 0 ].x - boundary[ 1 ].x, boundary[ 0 ].y - boundary[ 1 ].y )
    }
    get_vertex( index ){
        return this.vertexes[ index ]
    }

}