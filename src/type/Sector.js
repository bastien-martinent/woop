export default class Sector{
    constructor( edges, bottom_z = 0, top_z = 40, bottom_color = 1, top_color = 1 ){
        this.edges         = edges
        this.bottom_z      = bottom_z
        this.top_z         = top_z
        this.bottom_color  = bottom_color
        this.top_color     = top_color
        this.surface       = {
            state  : 0,
            points : [],
        }
        this.distance      = 0
    }
    find_surface_state( camera_z ){
        this.surface.state = ( this.bottom_z < camera_z ) ? ( this.top_z > camera_z ) ? 0 : 2 : 1
    }
    draw_sector( camera, screen ){
        this.distance              = 0 // clear distance
        this.surface.points.length = 0 // clear points
        this.find_surface_state( camera.position.z )
        for( let edge_index = 0; edge_index < this.edges.length; edge_index++ ){
            this.edges[ edge_index ].collect_points( this, camera, screen )
        }
        for( let edge_index = 0; edge_index < this.edges.length; edge_index++ ){
            this.edges[ edge_index ].draw_edge( this, camera, screen )
        }
        this.distance /= this.edges.length //find average sector distance ???
    }
}