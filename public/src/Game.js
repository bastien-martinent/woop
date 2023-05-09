import {CURSORS} from "./const.js"
import Int2DVertex from "./type/Int2DVertex.js"
import MoodMath from "./MoodMath.js";

export default class Game{
    constructor( mood ) {
        this.mood = mood
    }
    update = () => {
        if( this.mood.inputs.mouse_lock ){
            this.mood.player.horizontal_angle += Math.round( this.mood.inputs.mouse_movements.x / 8 )
        }else{
            if( this.mood.inputs.input_status.has( "look_left_down" ) ){ this.mood.player.horizontal_angle  += 2 }
            if( this.mood.inputs.input_status.has( "look_right_down" ) ){ this.mood.player.horizontal_angle -= 2 }
        }
        this.mood.player.horizontal_angle = MoodMath.angle_range( this.mood.player.horizontal_angle )

        let delta_y = Math.round( MoodMath.lookup_sin( this.mood.player.horizontal_angle ) * 6.0 )
        let delta_x = Math.round( MoodMath.lookup_cos( this.mood.player.horizontal_angle ) * 6.0 )

        if( this.mood.inputs.mouse_lock ){
            this.mood.player.look_vertical -= Math.round( this.mood.inputs.mouse_movements.y / 16 )
        }else{
            if( this.mood.inputs.input_status.has( "look_up_down" ) ){ this.mood.player.look_vertical -= 1 }
            if( this.mood.inputs.input_status.has( "look_down_down" ) ){ this.mood.player.look_vertical  += 1 }
        }
        this.mood.player.look_vertical = MoodMath.angle_range( this.mood.player.look_vertical, -90, 90, false )
        if( this.mood.inputs.input_status.has( "forward_down" ) && ! this.mood.inputs.input_status.has( "look_up_down" ) ){
            this.mood.player.position.x += delta_x; this.mood.player.position.y += delta_y
        }
        if( this.mood.inputs.input_status.has( "backward_down" ) && ! this.mood.inputs.input_status.has( "look_down_down" ) ){
            this.mood.player.position.x -= delta_x; this.mood.player.position.y -= delta_y
        }
        if( this.mood.inputs.input_status.has( "strafe_right_down" ) && ! this.mood.inputs.input_status.has( "look_right_down" ) ){
            this.mood.player.position.x += delta_y; this.mood.player.position.y -= delta_x
        }
        if( this.mood.inputs.input_status.has( "strafe_left_down" ) && ! this.mood.inputs.input_status.has( "look_left_down" ) ){
            this.mood.player.position.x -= delta_y; this.mood.player.position.y += delta_x
        }
        if( this.mood.inputs.input_status.has( "up_down" ) ){ this.mood.player.position.z += 4 }
        if( this.mood.inputs.input_status.has( "down_down" ) ){ this.mood.player.position.z -= 4 }
        //TODO:: add boundaries
    }
    render = ( renderer ) => {
        renderer.draw_background()

        //draw from bsp tree
        if( this.mood.level ) {
            renderer.draw_game_sector_in_field_of_view()
        }
    }
}