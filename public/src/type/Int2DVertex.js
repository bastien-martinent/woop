export default class Int2DVertex{
    constructor( x, y ){
        this.x = Math.round( x )
        this.y = Math.round( y )
    }
    set_x( x ){ this.x = Math.round( x ) }
    set_y( y ){ this.y = Math.round( y ) }
    clone() {
        return new Int2DVertex( this.x, this.y )
    }
    //todo get distance from this
}