export default class InputManager{
    constructor( mood ) {
        this.mood              = mood
        this.mouse_lock        = false
        this.input_status      = new Set()
        this.keys_press        = {
            keys_up   : new Set(),
            keys_down : new Set(),
        }
        this.mouse_press       = {
            buttons_up   : new Set(),
            buttons_down : new Set(),
        }
        this.mouse_movements   = {
            x     : 0,
            y     : 0,
            wheel : 0,
        }
        this.keys_map          = {
            editor_mode  : [ 9 ],
            game_mode    : [ 9 ],
            escape       : [ 27 ],
            enter        : [ 13 ],
            forward      : [ 87 ],
            backward     : [ 83 ],
            strafe_left  : [ 65 ],
            strafe_right : [ 68 ],
            look_left    : [ 16, 65 ],
            look_right   : [ 16, 68 ],
            look_up      : [ 16, 87 ],
            look_down    : [ 16, 83 ],
            up           : [ 81 ],
            down         : [ 69 ],
        }
        this.mouse_buttons_map = {
            editor_grab     : [ 0 ],
            mouse_middle    : [ 1 ],
            mouse_right     : [ 2 ],
            mouse_page_down : [ 3 ],
            mouse_page_up   : [ 4 ],
        }
        this.init_input_listener()
    }
    resolve_keys(){
        //resolve mapped keys press
        Object.keys( this.keys_map ).forEach( key => {
            let key_down = true
            let key_up   = true
            this.keys_map[ key ].forEach( ( k ) => { if( ! this.keys_press.keys_down.has( k ) ){ key_down = false } } )
            this.keys_map[ key ].forEach( ( k ) => { if( ! this.keys_press.keys_up.has( k ) ){ key_up = false } } )
            if( key_down ){ this.input_status.add( key+"_down" ) }else{ this.input_status.delete( key+"_down" ) }
            if( key_up ){ this.input_status.add( key+"_release" ) }else{ this.input_status.delete( key+"_release" ) }
        })
        Object.keys( this.mouse_buttons_map ).forEach( button => {
            let key_down = true
            let key_up   = true
            this.mouse_buttons_map[ button ].forEach( ( k ) => { if( ! this.mouse_press.buttons_down.has( k ) ){ key_down = false } } )
            this.mouse_buttons_map[ button ].forEach( ( k ) => { if( ! this.mouse_press.buttons_up.has( k ) ){ key_up = false } } )
            if( key_down ){ this.input_status.add( button+"_down" ) }else{ this.input_status.delete( button+"_down" ) }
            if( key_up ){ this.input_status.add( button+"_release" ) }else{ this.input_status.delete( button+"_release" ) }
        })
        this.keys_press.keys_up.clear()
        this.mouse_press.buttons_up.clear()
    }
    clear_mouse_movements(){
        this.mouse_movements.x     = 0
        this.mouse_movements.y     = 0
        this.mouse_movements.wheel = 0
    }
    update_mouse_movements( input_manager, event ){
        input_manager.mouse_movements.x += event.movementX * .5
        input_manager.mouse_movements.y += event.movementY * .5
    }
    update_mouse_wheel( input_manager, event ){
        input_manager.mouse_movements.wheel += event.deltaY
    }
    update_key_up( input_manager, event ){
        event.preventDefault()
        input_manager.keys_press.keys_up.add( event.keyCode )
        input_manager.keys_press.keys_down.delete( event.keyCode )
    }
    update_key_down( input_manager, event ){
        event.preventDefault()
        input_manager.keys_press.keys_down.add( event.keyCode )
        input_manager.keys_press.keys_up.delete( event.keyCode )
    }
    update_mouse_click_up( input_manager, event ){
        input_manager.mouse_press.buttons_up.add( event.button )
        input_manager.mouse_press.buttons_down.delete( event.button )
    }
    update_mouse_click_down( input_manager, event ){
        input_manager.mouse_press.buttons_up.delete( event.button )
        input_manager.mouse_press.buttons_down.add( event.button )
    }
    init_input_listener(){
        window.addEventListener("keyup", ( event ) => { this.update_key_up( this, event ) }, true )
        window.addEventListener("keydown", ( event ) => { this.update_key_down( this, event ) }, true )
        document.addEventListener("pointerlockchange", () => {
            if( document.pointerLockElement ){
                this.mouse_lock = true
                document.addEventListener("mousemove", ( event ) => { this.update_mouse_movements( this, event ) }, true )
                document.addEventListener("wheel", ( event ) => { this.update_mouse_wheel( this, event ) }, true )
                document.addEventListener("mouseup", ( event ) => { this.update_mouse_click_up( this, event ) }, true )
                document.addEventListener("mousedown", ( event ) => { this.update_mouse_click_down( this, event ) }, true )
            }else{
                this.mouse_lock = false
                document.removeEventListener( "mousemove", this.update_mouse_movements )
                document.removeEventListener( "wheel", this.update_mouse_wheel )
                document.removeEventListener( "mouseup", this.update_mouse_click_up )
                document.removeEventListener( "mousedown", this.update_mouse_click_down )
            }
        } )
        this.mood.renderer.canvas.addEventListener( "click", async () => {
            if( ! document.pointerLockElement ){ await this.mood.renderer.canvas.requestPointerLock( { unadjustedMovement: true } ) }
        }, false )
    }
}
