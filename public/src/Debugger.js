export default class Debugger {
    constructor( mood, enable = true ){
        this.mood        = mood
        this.enable      = enable
        this.is_init     = false
        this.head        = null
        this.body        = null
        this.map_context = null
    }

    init(){
        let head          = document.createElement("pre" )
        let body          = document.createElement("pre" )
        let ratio         = Math.min(200 / this.mood.level.size.x, 200 / this.mood.level.size.y )
        let map_display_x = Math.round( this.mood.level.size.x * ratio )
        let map_display_y = Math.round( this.mood.level.size.y * ratio )

        head.id                    = "debug_head"
        head.style.position        = "absolute"
        head.style.display         = "block"
        head.style.top             = "50px"
        head.style.right           = "50px"
        head.style.width           = "216px"
        head.style.height          = "16px"
        head.style.backgroundColor = "#850000"
        head.style.color           = "#ffffff"
        head.style.margin          = "0px"
        head.style.padding         = "2px"
        head.innerHTML             += "Debugger"

        body.id                    = "debug_body"
        body.style.position        = "absolute"
        body.style.display         = "none"
        body.style.top             = "70px"
        body.style.right           = "50px"
        body.style.width           = "200px"
        body.style.backgroundColor = "#ffffffaa"
        body.style.margin          = "0px"
        body.style.padding         = "10px"
        body.innerHTML             += "Fps : <span id='debug_frame_rate'></span><br>"
        body.innerHTML             += "Game state : <span id='debug_game_state'></span><br>"
        body.innerHTML             += "viewport resolution : <span id='debug_vp_res'></span><br>"
        body.innerHTML             += "Internal resolution : <span id='debug_int_res'></span><br>"
        body.innerHTML             += "Pixel scale : <span id='debug_p_scale'></span><br>"
        body.innerHTML             += "Keys press : <span id='debug_keys'></span><br>"
        body.innerHTML             += "Mouse position : <span id='debug_mouse'></span><br>"
        body.innerHTML             += "Cursor position : <span id='debug_cursor'></span><br>"
        body.innerHTML             += "Editor position : <span id='debug_editor_pos'></span><br>"
        body.innerHTML             += "<canvas id='debug_map' width='"+map_display_x+"' height='"+map_display_y+"'></canvas>"
        body.innerHTML             += "Player position : <br><span id='debug_p_pos'></span><br><span id='debug_p_ang'></span><br>"

        document.body.append( head )
        document.body.append( body )

        this.head                    = head
        this.body                    = body
        this.map_context             = document.getElementById( "debug_map" ).getContext( "2d" )
        this.map_context.fillStyle   = "rgba( 0, 0, 0 , 1 )"
        this.map_context.strokeStyle = "rgba( 0, 0, 0 , 1 )"
        this.map_context.strokeRect( 0, 0, map_display_x, map_display_y )

        this.head.addEventListener( 'click', () => {
            this.body.display = ( this.body.display === "block" ) ? "none" : "block"
            this.body.style.setProperty('display', this.body.display )
        } )

        this.is_init = true
    }

    switch(){
        this.enable = ! this.enable
        if( ! this.enable ){
            this.body.remove()
            this.body    = null
            this.is_init = false
        }
    }

    update(){
        if( ! this.enable ){ return }
        if( ! this.is_init ){ this.init() }
        document.getElementById("debug_game_state").innerHTML = this.mood.game_state
        document.getElementById("debug_vp_res").innerHTML     = "<br>y-" + this.mood.renderer.canvas.width + " x-" + this.mood.renderer.canvas.height
        document.getElementById("debug_int_res").innerHTML    = "<br>y-" + this.mood.renderer.internal_width + " x-" + this.mood.renderer.internal_height
        document.getElementById("debug_frame_rate").innerHTML = this.mood.time.last_frame_count
        document.getElementById("debug_keys").innerHTML       = '<br>'+JSON.stringify( Array.from( this.mood.inputs.input_status ).join(" ,<br>") )
        document.getElementById("debug_mouse").innerHTML      = "<br>mouse "+( ( this.mood.inputs.mouse_lock ) ? "lock " : "unlock " )+"x-"+this.mood.inputs.mouse_movements.x+" y-"+this.mood.inputs.mouse_movements.y
        document.getElementById("debug_cursor").innerHTML     = "<br>x-"+this.mood.editor.cursor.position.x+" <br>y-"+this.mood.editor.cursor.position.y
        document.getElementById("debug_editor_pos").innerHTML = "<br>x-"+this.mood.editor.grid_pos.x+" <br>y-"+this.mood.editor.grid_pos.y
        document.getElementById("debug_p_pos").innerHTML      = "<br>x-"+this.mood.player.position.x+" <br>y-"+this.mood.player.position.y+" <br>z-"+this.mood.player.position.z
        document.getElementById("debug_p_ang").innerHTML      = "h_angle-"+this.mood.player.look_horizontal+" v_angle-"+this.mood.player.look_vertical
    }

    render(){
        if( ! this.enable ){ return }
        if( ! this.is_init ){ this.init() }
        let ratio         = Math.min( 200 / this.mood.level.size.x, 200 / this.mood.level.size.y );
        let map_display_x = Math.round( this.mood.level.size.x * ratio )
        let map_display_y = Math.round( this.mood.level.size.y * ratio )
        let x1            = Math.round( this.mood.player.position.x / this.mood.level.size.x * map_display_x )
        let y1            = Math.round( ( this.mood.level.size.y - this.mood.player.position.y ) / this.mood.level.size.y * map_display_y )
        let map_look      = this.mood.math_utility.angle_range( this.mood.player.look_horizontal - 90 )
        let x2            = Math.round( x1 + 10 * this.mood.math_utility.lookup_table.cos[ map_look ]  )
        let y2            = Math.round( y1 + 10 * this.mood.math_utility.lookup_table.sin[ map_look ] )
        // clear map
        this.map_context.fillStyle = "rgba( 0, 0, 0 , 0)"
        this.map_context.strokeStyle = "rgba( 0, 0, 0 , 1)"
        this.map_context.clearRect(1, 1, map_display_x - 2, map_display_y - 2 )
        this.map_context.strokeRect(0, 0, map_display_x, map_display_y )
        // player pos
        this.map_context.beginPath()
        this.map_context.fillStyle = "rgba( 245, 40, 145 , 1)"
        this.map_context.arc( x1, y1, 2, 0, 2 * Math.PI, false )
        this.map_context.fill()
        // arrow
        this.map_context.fillStyle = "rgba( 0, 0, 0 , 0 )"
        this.map_context.strokeStyle = "rgba( 40, 40, 40 , 1 )"
        this.map_context.beginPath()
        this.map_context.moveTo( x1, y1 )
        this.map_context.lineTo( x2, y2 )
        this.map_context.stroke()
    }
}
