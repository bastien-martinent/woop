import WoopMath from "./WoopMath.js"

export default class Debugger {
    constructor( woop, enable = true ){
        this.woop        = woop
        this.enable      = enable
        this.is_init     = false
        this.head        = null
        this.body        = null
        this.map_context = null
    }

    init(){
        let head          = document.createElement("pre" )
        let body          = document.createElement("pre" )
        let ratio         = Math.min(200 / this.woop.level.size.x, 200 / this.woop.level.size.y )
        let map_display_x = Math.round( this.woop.level.size.x * ratio )
        let map_display_y = Math.round( this.woop.level.size.y * ratio )

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
        head.innerHTML             += "Debugger <span style='float:right' id='debug_frame_rate'></span><br>"

        body.id                    = "debug_body"
        body.style.position        = "absolute"
        body.style.display         = "none"
        body.style.top             = "70px"
        body.style.right           = "50px"
        body.style.width           = "200px"
        body.style.backgroundColor = "#ffffffaa"
        body.style.margin          = "0px"
        body.style.padding         = "10px"
        body.innerHTML             += "Fps : <span id='debug_frame_rate2'></span><br>"
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
        document.getElementById("debug_game_state").innerHTML = this.woop.game_state
        document.getElementById("debug_vp_res").innerHTML     = "<br>y-" + this.woop.renderer.canvas.width + " x-" + this.woop.renderer.canvas.height
        document.getElementById("debug_int_res").innerHTML    = "<br>y-" + this.woop.renderer.internal_width + " x-" + this.woop.renderer.internal_height
        document.getElementById("debug_frame_rate").innerHTML = this.woop.time.last_frame_count
        document.getElementById("debug_frame_rate2").innerHTML = this.woop.time.last_frame_count
        document.getElementById("debug_keys").innerHTML       = '<br>'+JSON.stringify( Array.from( this.woop.inputs.input_status ).join(" ,<br>") )
        document.getElementById("debug_mouse").innerHTML      = "<br>mouse "+( ( this.woop.inputs.mouse_lock ) ? "lock " : "unlock " )+"x-"+this.woop.inputs.mouse_movements.x+" y-"+this.woop.inputs.mouse_movements.y
        document.getElementById("debug_cursor").innerHTML     = "<br>x-"+this.woop.editor.cursor.position.x+" <br>y-"+this.woop.editor.cursor.position.y
        document.getElementById("debug_editor_pos").innerHTML = "<br>x-"+this.woop.editor.grid_pos.x+" <br>y-"+this.woop.editor.grid_pos.y
        document.getElementById("debug_p_pos").innerHTML      = "<br>x-"+this.woop.player.position.x+" <br>y-"+this.woop.player.position.y+" <br>z-"+this.woop.player.position.z
        document.getElementById("debug_p_ang").innerHTML      = "h_angle-"+this.woop.player.horizontal_angle+" v_angle-"+this.woop.player.look_vertical
    }

    render(){
        if( ! this.enable ){ return }
        if( ! this.is_init ){ this.init() }
        let ratio         = Math.min( 200 / this.woop.level.size.x, 200 / this.woop.level.size.y );
        let map_display_x = Math.round( this.woop.level.size.x * ratio )
        let map_display_y = Math.round( this.woop.level.size.y * ratio )
        let x1            = Math.round( this.woop.player.position.x / this.woop.level.size.x * map_display_x )
        let y1            = Math.round( ( this.woop.level.size.y - this.woop.player.position.y ) / this.woop.level.size.y * map_display_y )
        let map_look      = WoopMath.angle_range( this.woop.player.horizontal_angle - 90 )
        let x2            = Math.round( x1 + 10 * WoopMath.lookup_cos[ map_look ]  )
        let y2            = Math.round( y1 + 10 * WoopMath.lookup_sin[ map_look ] )
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
