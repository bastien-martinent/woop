export default class Int3DVertex{
    constructor( x, y, z ){
        this.x = Math.round( x )
        this.y = Math.round( y )
        this.z = Math.round( z )
    }
    set_x( x ){ this.x = Math.round( x ) }
    set_y( y ){ this.y = Math.round( y ) }
    set_z( z ){ this.x = Math.round( z ) }
    //todo get distance from this
}