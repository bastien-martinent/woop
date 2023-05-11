import Int2DVertex from "./type/Int2DVertex.js"
import { GAME_STATES, CURSORS } from "./const.js"
import WoopMath from "./WoopMath.js"

export default class Editor{
    constructor( woop ) {
        this.woop            = woop
        this.grid_pos        = woop.level.boundary[ 0 ].clone()
        this.grid_zoom       = 13
        this.unit_pixel_size = .016
        this.unit_by_ceil    = 100
        this.cursor          = {
            state    : CURSORS.ARROW,
            position : new Int2DVertex( this.woop.renderer.canvas.width / 2, this.woop.renderer.canvas.height / 2 ),
        }
        this.grid_pos.set_x( this.grid_pos.x - 200 )
        this.grid_pos.set_y( this.grid_pos.y + 200 )
    }
    grid_scale(){
        return this.unit_pixel_size * this.grid_zoom
    }
    ceil_pixel_size(){
        return this.unit_pixel_size * this.unit_by_ceil * this.grid_zoom
    }
    update(){
        this.cursor.position.set_x( WoopMath.value_range( this.cursor.position.x + this.woop.inputs.mouse_movements.x, 0, this.woop.renderer.canvas.width ) )
        this.cursor.position.set_y( WoopMath.value_range( this.cursor.position.y + this.woop.inputs.mouse_movements.y, 0, this.woop.renderer.canvas.height ) )
        this.grid_zoom = WoopMath.value_range( this.grid_zoom - ( this.woop.inputs.mouse_movements.wheel / 100 ), 5, 40 )

        if( this.woop.inputs.input_status.has( "editor_grab_down" ) ){
            this.cursor.state = CURSORS.GRAB
            this.grid_pos.set_x( this.grid_pos.x - ( this.woop.inputs.mouse_movements.x / this.unit_pixel_size / this.grid_zoom ) )
            this.grid_pos.set_y( this.grid_pos.y + ( this.woop.inputs.mouse_movements.y / this.unit_pixel_size / this.grid_zoom ) )
        }else{
            this.cursor.state = CURSORS.ARROW
        }

        if( this.woop.debbuger.enable ){
            if( this.woop.inputs.input_status.has( "look_left_down" ) ){ this.woop.player.horizontal_angle  += 2 }
            if( this.woop.inputs.input_status.has( "look_right_down" ) ){ this.woop.player.horizontal_angle -= 2 }
            this.woop.player.horizontal_angle = WoopMath.angle_range( this.woop.player.horizontal_angle )
            let delta_y = Math.round( WoopMath.lookup_sin( this.woop.player.horizontal_angle ) * 6.0 )
            let delta_x = Math.round( WoopMath.lookup_cos( this.woop.player.horizontal_angle ) * 6.0 )
            if( this.woop.inputs.input_status.has( "forward_down" ) && ! this.woop.inputs.input_status.has( "look_up_down" ) ){
                this.woop.player.position.x += delta_x; this.woop.player.position.y += delta_y
            }
            if( this.woop.inputs.input_status.has( "backward_down" ) && ! this.woop.inputs.input_status.has( "look_down_down" ) ){
                this.woop.player.position.x -= delta_x; this.woop.player.position.y -= delta_y
            }
            if( this.woop.inputs.input_status.has( "strafe_right_down" ) && ! this.woop.inputs.input_status.has( "look_right_down" ) ){
                this.woop.player.position.x += delta_y; this.woop.player.position.y -= delta_x
            }
            if( this.woop.inputs.input_status.has( "strafe_left_down" ) && ! this.woop.inputs.input_status.has( "look_left_down" ) ){
                this.woop.player.position.x -= delta_y; this.woop.player.position.y += delta_x
            }

            //TODO:: add boundaries
        }
    }
    render( renderer ){
        renderer.draw_background( "black" )

        renderer.update_render_variables( "editor", {
            grid_scale     :  this.grid_scale(),
            pixel_x_offset : this.grid_pos.x * this.unit_pixel_size * this.grid_zoom,
            pixel_y_offset : ( this.grid_pos.y * -1 ) * this.unit_pixel_size * this.grid_zoom,
        } )

        //draw grid
        renderer.draw_editor_grid()

        //draw level
        if( this.woop.level ){
            //draw level boundary
            renderer.draw_editor_box( this.woop.level.boundary[ 0 ].x, this.woop.level.boundary[ 0 ].y, this.woop.level.boundary[ 1 ].x, this.woop.level.boundary[ 1 ].y )
            //draw vertices
            this.woop.level.vertices.forEach( ( vertex ) => {
                renderer.draw_editor_point( vertex.x , vertex.y )
            } )
            //draw edge
            this.woop.level.segments.forEach( ( segment ) => {
                renderer.draw_editor_line( segment.vertices[ 0 ].x, segment.vertices[ 0 ].y, segment.vertices[ 1 ].x, segment.vertices[ 1 ].y )
            } )
            //draw from bsp tree
            renderer.draw_editor_sector_in_field_of_view()
        }

        if( this.woop.player ){
            renderer.draw_editor_player()
        }

        if( this.woop.inputs.mouse_lock ){
            renderer.draw_cursor( this.cursor.position.x, this.cursor.position.y, this.cursor.state )
        }

    }
}