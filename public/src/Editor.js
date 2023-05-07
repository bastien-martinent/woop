import Int2DVertex from "./type/Int2DVertex.js"
import { GAME_STATES, CURSORS } from "./const.js"

export default class Editor{
    constructor( mood ) {
        this.mood            = mood
        this.grid_pos        = mood.level.boundary[ 0 ].clone()
        this.grid_zoom       = 20
        this.unit_pixel_size = .016
        this.unit_by_ceil    = 100
        this.cursor          = {
            state    : CURSORS.ARROW,
            position : new Int2DVertex( this.mood.renderer.canvas.width / 2, this.mood.renderer.canvas.height / 2 ),
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
        this.cursor.position.set_x( this.mood.math_utility.value_range( this.cursor.position.x + this.mood.inputs.mouse_movements.x, 0, this.mood.renderer.canvas.width ) )
        this.cursor.position.set_y( this.mood.math_utility.value_range( this.cursor.position.y + this.mood.inputs.mouse_movements.y, 0, this.mood.renderer.canvas.height ) )
        this.grid_zoom = this.mood.math_utility.value_range( this.grid_zoom - ( this.mood.inputs.mouse_movements.wheel / 100 ), 10, 30 )

        if( this.mood.inputs.input_status.has( "editor_grab_down" ) ){
            this.cursor.state = CURSORS.GRAB
            this.grid_pos.set_x( this.grid_pos.x - ( this.mood.inputs.mouse_movements.x / this.unit_pixel_size / this.grid_zoom ) )
            this.grid_pos.set_y( this.grid_pos.y + ( this.mood.inputs.mouse_movements.y / this.unit_pixel_size / this.grid_zoom ) )
        }else{
            this.cursor.state = CURSORS.ARROW
        }

        //Temp control for debug
        if( this.mood.debbuger.enable ){
            if( this.mood.inputs.input_status.has( "look_left_down" ) ){ this.mood.player.look_horizontal  -= 2 }
            if( this.mood.inputs.input_status.has( "look_right_down" ) ){ this.mood.player.look_horizontal += 2 }
            this.mood.player.look_horizontal = this.mood.math_utility.angle_range( this.mood.player.look_horizontal )
            let delta_x = Math.round( this.mood.math_utility.lookup_table.sin[ this.mood.player.look_horizontal ] * 6.0 )
            let delta_y = Math.round( this.mood.math_utility.lookup_table.cos[ this.mood.player.look_horizontal ] * 6.0 )
            if( this.mood.inputs.input_status.has( "forward_down" ) && ! this.mood.inputs.input_status.has( "look_up_down" ) ){
                this.mood.player.position.x -= delta_x; this.mood.player.position.y -= delta_y
            }
            if( this.mood.inputs.input_status.has( "backward_down" ) && ! this.mood.inputs.input_status.has( "look_down_down" ) ){
                this.mood.player.position.x += delta_x; this.mood.player.position.y += delta_y
            }
            if( this.mood.inputs.input_status.has( "strafe_right_down" ) && ! this.mood.inputs.input_status.has( "look_right_down" ) ){
                this.mood.player.position.x -= delta_y; this.mood.player.position.y += delta_x
            }
            if( this.mood.inputs.input_status.has( "strafe_left_down" ) && ! this.mood.inputs.input_status.has( "look_left_down" ) ){
                this.mood.player.position.x += delta_y; this.mood.player.position.y -= delta_x
            }
        }
    }
    render( renderer ){
        renderer.clear_background( "black" )

        let pixel_x_offset      = this.grid_pos.x * this.unit_pixel_size * this.grid_zoom
        let pixel_y_offset      = ( this.grid_pos.y * -1 ) * this.unit_pixel_size * this.grid_zoom

        //draw grid
        renderer.draw_grid( pixel_x_offset, pixel_y_offset )

        //draw level
        if( this.mood.level ){
            //draw level boundary
            renderer.draw_box(
                this.mood.level.boundary[ 0 ].x * this.grid_scale() - pixel_x_offset,
                this.mood.level.boundary[ 0 ].y * -1 * this.grid_scale() - pixel_y_offset,
                this.mood.level.boundary[ 1 ].x * this.grid_scale() - pixel_x_offset,
                this.mood.level.boundary[ 1 ].y * -1 * this.grid_scale() - pixel_y_offset,
            )
            //draw vertices
            this.mood.level.vertices.forEach( ( vertex ) => {
                renderer.draw_point(
                    vertex.x * this.grid_scale() - pixel_x_offset,
                    vertex.y * -1 * this.grid_scale() - pixel_y_offset,
                )
            } )
            //draw edge
            this.mood.level.edges.forEach( ( edge ) => {
                renderer.draw_line(
                    edge.vertices[ 0 ].x * this.grid_scale() - pixel_x_offset,
                    edge.vertices[ 0 ].y * -1 * this.grid_scale() - pixel_y_offset,
                    edge.vertices[ 1 ].x * this.grid_scale() - pixel_x_offset,
                    edge.vertices[ 1 ].y * -1 * this.grid_scale() - pixel_y_offset
                )
            } )

            //draw bsp tree
            renderer.draw_bsp_tree( pixel_x_offset, pixel_y_offset )
        }

        if( this.mood.player ){
            renderer.draw_player_position( pixel_x_offset, pixel_y_offset )
        }

        if( this.mood.inputs.mouse_lock ){
            renderer.draw_cursor( this.cursor.position.x, this.cursor.position.y, this.cursor.state )
        }

    }
}