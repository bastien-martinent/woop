import {CURSORS} from "./const.js"
import Int2DVertex from "./type/Int2DVertex.js"
import WoopMath from "./WoopMath.js";

export default class Game{
    constructor( woop ) {
        this.woop = woop
    }
    update = () => {
        if( this.woop.inputs.mouse_lock ){
            this.woop.player.horizontal_angle -= Math.round( this.woop.inputs.mouse_movements.x / 8 )
        }else{
            if( this.woop.inputs.input_status.has( "look_left_down" ) ){ this.woop.player.horizontal_angle  += 2 }
            if( this.woop.inputs.input_status.has( "look_right_down" ) ){ this.woop.player.horizontal_angle -= 2 }
        }
        this.woop.player.horizontal_angle = WoopMath.angle_range( this.woop.player.horizontal_angle )

        let delta_y = Math.round( WoopMath.lookup_sin( this.woop.player.horizontal_angle ) * 6.0 )
        let delta_x = Math.round( WoopMath.lookup_cos( this.woop.player.horizontal_angle ) * 6.0 )

        if( this.woop.inputs.mouse_lock ){
            this.woop.player.look_vertical -= Math.round( this.woop.inputs.mouse_movements.y / 16 )
        }else{
            if( this.woop.inputs.input_status.has( "look_up_down" ) ){ this.woop.player.look_vertical -= 1 }
            if( this.woop.inputs.input_status.has( "look_down_down" ) ){ this.woop.player.look_vertical  += 1 }
        }
        this.woop.player.look_vertical = WoopMath.angle_range( this.woop.player.look_vertical, -90, 90, false )
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
        if( this.woop.inputs.input_status.has( "up_down" ) ){ this.woop.player.position.z += 4 }
        if( this.woop.inputs.input_status.has( "down_down" ) ){ this.woop.player.position.z -= 4 }
        //TODO:: add boundaries
    }
    render = ( renderer ) => {
        renderer.draw_background()

        //draw from bsp tree
        if( this.woop.level ) {
            renderer.draw_game_sector_in_field_of_view()
        }
    }
}