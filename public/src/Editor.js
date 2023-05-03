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

        let screen_step_x       = Math.ceil( renderer.canvas.width / this.ceil_pixel_size() )
        let screen_step_y       = Math.ceil( renderer.canvas.height / this.ceil_pixel_size() )
        let pos_x_offset        = this.grid_pos.x
        let pos_y_offset        = this.grid_pos.y * -1
        let pixel_x_offset      = pos_x_offset * this.unit_pixel_size * this.grid_zoom
        let pixel_y_offset      = pos_y_offset * this.unit_pixel_size * this.grid_zoom
        let pixel_grid_x_offset = pixel_x_offset % this.ceil_pixel_size()
        let pixel_grid_y_offset = pixel_y_offset % this.ceil_pixel_size()
        let ceil_x_offset       = Math.floor( pos_x_offset / this.unit_by_ceil )
        let ceil_y_offset       = Math.floor( pos_y_offset / this.unit_by_ceil ) * -1
        let zero_lines          = []

        //draw grid
        renderer.context.beginPath()
        renderer.context.strokeStyle = "rgba( 120, 120, 120, 1 )"
        renderer.context.fillStyle   = "rgba( 255, 255, 255, 1 )"
        renderer.context.lineWidth   = 1
        renderer.context.font        = "6px";
        renderer.context.fillText( "x", 30 , 20 )
        renderer.context.fillText( "y", 20 , 30 )
        for( let x = 0; x <= screen_step_x; x++ ){
            if( x > 1 ){ renderer.context.fillText( ( x + ceil_x_offset ) * this.unit_by_ceil, x * this.ceil_pixel_size() - pixel_grid_x_offset, 20 ) }
            if( 0 !== Math.ceil( ( x + ceil_x_offset ) * this.unit_by_ceil ) ){
                renderer.context.moveTo( x * this.ceil_pixel_size() - pixel_grid_x_offset, 0 )
                renderer.context.lineTo( x * this.ceil_pixel_size() - pixel_grid_x_offset, renderer.canvas.height )
            }else{
                zero_lines.push( [
                    x * this.ceil_pixel_size() - pixel_grid_x_offset,
                    0,
                    x * this.ceil_pixel_size() - pixel_grid_x_offset,
                    renderer.canvas.height
                ] )
            }
        }
        for( let y = 0; y <= screen_step_y; y++ ){
            if( y > 1 ){ renderer.context.fillText( ( y * -1 + ceil_y_offset ) * this.unit_by_ceil, 20, y * this.ceil_pixel_size() - pixel_grid_y_offset ) }
            if( 0 !== Math.ceil( (  y * -1 + ceil_y_offset ) * this.unit_by_ceil ) ){
                renderer.context.moveTo( 0,                  y * this.ceil_pixel_size() - pixel_grid_y_offset )
                renderer.context.lineTo( renderer.canvas.width, y * this.ceil_pixel_size() - pixel_grid_y_offset )
            }else{
                zero_lines.push( [
                    0,
                    y * this.ceil_pixel_size() - pixel_grid_y_offset,
                    renderer.canvas.width,
                    y * this.ceil_pixel_size() - pixel_grid_y_offset
                ] )
            }
        }
        renderer.context.stroke()

        if( zero_lines.length > 0 ){
            renderer.context.beginPath()
            renderer.context.lineWidth   = 2
            renderer.context.strokeStyle = "rgba( 120, 0 , 0, 1 )"
            zero_lines.forEach( ( p ) => {
                renderer.context.moveTo( p[ 0 ], p[ 1 ] )
                renderer.context.lineTo( p[ 2 ], p[ 3 ] )
            } )
            renderer.context.stroke()
        }

        //draw level
        if( this.mood.level ){
            //draw level boundary
            renderer.context.strokeStyle = "rgba( 20, 90, 0, 1 )"
            renderer.context.fillStyle   = "rgba( 0, 0, 0 , 1 )"
            renderer.context.strokeRect(
                this.mood.level.boundary[ 1 ].x * this.grid_scale() - pixel_x_offset,
                this.mood.level.boundary[ 1 ].y * -1 * this.grid_scale() - pixel_y_offset,
                this.mood.level.size.x * this.grid_scale(),
                this.mood.level.size.y * -1 * this.grid_scale(),
            )

            //draw point
            renderer.context.strokeStyle = "rgba( 255, 255, 255, 1 )"
            renderer.context.fillStyle   = "rgba( 100, 100, 100 ,.6 )"
            this.mood.level.vertices.forEach( ( vertex ) => {
                renderer.draw_point(
                    vertex.x * this.grid_scale() - pixel_x_offset,
                    vertex.y * -1 * this.grid_scale() - pixel_y_offset,
                )
            } )

            //draw edge
            renderer.context.strokeStyle = "rgba( 100, 100, 100, 1 )"
            renderer.context.beginPath()
            this.mood.level.edges.forEach( ( edge ) => {
                renderer.context.moveTo(
                    edge.vertices[ 0 ].x * this.grid_scale() - pixel_x_offset,
                    edge.vertices[ 0 ].y * -1 * this.grid_scale() - pixel_y_offset
                )
                renderer.context.lineTo(
                    edge.vertices[ 1 ].x * this.grid_scale() - pixel_x_offset,
                    edge.vertices[ 1 ].y * -1 * this.grid_scale() - pixel_y_offset
                )
            } )
            renderer.context.stroke()

            //draw segment
            renderer.context.strokeStyle = "rgb( 80, 160, 80, 1 )"
            renderer.context.beginPath()
            this.mood.level.segments.forEach( ( segment ) => {
                renderer.context.moveTo(
                    segment.vertices[ 0 ].x * this.grid_scale() - pixel_x_offset,
                    segment.vertices[ 0 ].y * this.grid_scale() - pixel_y_offset
                )
                renderer.context.lineTo(
                    segment.vertices[ 1 ].x * this.grid_scale() - pixel_x_offset,
                    segment.vertices[ 1 ].y * this.grid_scale() - pixel_y_offset
                )
            } )
            renderer.context.stroke()
        }

        if( this.mood.player ){
            //draw player
            let player_position_x        = this.mood.player.position.x * this.grid_scale() - pixel_x_offset
            let player_position_y        = this.mood.player.position.y * -1 * this.grid_scale() - pixel_y_offset
            let player_look_horizontal  = this.mood.math_utility.angle_range( this.mood.player.look_horizontal + 90 )
            renderer.draw_point( player_position_x, player_position_y, "red", "dark red", 4, 4 )
            renderer.context.beginPath()
            renderer.context.lineWidth   = 4
            renderer.context.strokeStyle = "rgba( 90, 5, 5, 1 )"
            renderer.context.fillStyle   = "rgba( 90, 5, 5, .6 )"
            renderer.context.moveTo( player_position_x, player_position_y )
            renderer.context.lineTo(
                Math.round( player_position_x + 30 * this.mood.math_utility.lookup_table.cos[ player_look_horizontal ] ),
                Math.round( player_position_y + 30 * this.mood.math_utility.lookup_table.sin[ player_look_horizontal ] )
            )
            renderer.context.stroke()
        }

        if( this.mood.inputs.mouse_lock ){
            renderer.draw_cursor( this.cursor.position.x, this.cursor.position.y, this.cursor.state )
        }

    }
}