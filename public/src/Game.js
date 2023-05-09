import {CURSORS} from "./const.js"
import Int2DVertex from "./type/Int2DVertex.js"

export default class Game{
    constructor( mood ) {
        this.mood = mood
    }
    update = () => {
        if( this.mood.inputs.mouse_lock ){
            this.mood.player.look_horizontal += Math.round( this.mood.inputs.mouse_movements.x / 8 )
        }else{
            if( this.mood.inputs.input_status.has( "look_left_down" ) ){ this.mood.player.look_horizontal  += 2 }
            if( this.mood.inputs.input_status.has( "look_right_down" ) ){ this.mood.player.look_horizontal -= 2 }
        }
        this.mood.player.look_horizontal = this.mood.mood_math.angle_range( this.mood.player.look_horizontal )

        let delta_y = Math.round( this.mood.mood_math.lookup_table.sin[ this.mood.player.look_horizontal ] * 6.0 )
        let delta_x = Math.round( this.mood.mood_math.lookup_table.cos[ this.mood.player.look_horizontal ] * 6.0 )

        if( this.mood.inputs.mouse_lock ){
            this.mood.player.look_vertical -= Math.round( this.mood.inputs.mouse_movements.y / 16 )
        }else{
            if( this.mood.inputs.input_status.has( "look_up_down" ) ){ this.mood.player.look_vertical -= 1 }
            if( this.mood.inputs.input_status.has( "look_down_down" ) ){ this.mood.player.look_vertical  += 1 }
        }
        this.mood.player.look_vertical = this.mood.mood_math.angle_range( this.mood.player.look_vertical, -90, 90, false )
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
        renderer.clear_background()
    }
}