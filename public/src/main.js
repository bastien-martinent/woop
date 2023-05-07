import Int2DVertex from "./type/Int2DVertex.js"
import Int3DVertex from "./type/Int3DVertex.js"

import { BSPTree, BSPNode } from "./BSPTree.js"
import { GAME_STATES, CURSORS } from "./const.js"

import WadLoader from "./WadLoader.js"
import MathUtility from "./MathUtility.js"
import Debugger from "./Debugger.js"
import Player from "./Player.js"
import Editor from "./Editor.js"

class Renderer{
    constructor( mood, canvas, render_mode = '2D', pixel_scale = 8 ){
        this.mood        = mood
        this.canvas      = canvas
        this.render_mode = render_mode
        this.pixel_scale = pixel_scale
        this.colors      = [
            { name : "black",         value : [ 33, 33, 33 ] },
            { name : "blacker black", value : [ 0, 0, 0 ] },
            { name : "white",         value : [ 255, 255, 255 ] },
            { name : "lite grey",     value : [ 210, 210, 210 ] },
            { name : "grey",          value : [ 150, 150, 150 ] },
            { name : "dark grey",     value : [ 100, 100, 100 ] },
            { name : "yellow",        value : [ 255, 255, 0 ] },
            { name : "dark yellow",   value : [ 160, 160, 0 ] },
            { name : "green",         value : [ 0, 255, 0 ] },
            { name : "dark green",    value : [ 0, 160, 0 ] },
            { name : "cyan",          value : [ 0, 255, 255 ] },
            { name : "dark cyan",     value : [ 0, 160, 160 ] },
            { name : "red",           value : [ 200, 0, 0 ] },
            { name : "dark red",      value : [ 150, 0, 0 ] },
            { name : "blue",          value : [ 0, 0, 200 ] },
            { name : "dark blue",     value : [ 0, 0, 130 ] },
            { name : "brown",         value : [ 160, 100, 0 ] },
            { name : "dark brown",    value : [ 110, 50,  0 ] },
            { name : "background",    value : [ 0, 60,  130 ] },
            { name : "default",       value : [ 0, 60,  130 ] },
        ]

        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.context = canvas.getContext( "2d" )
                break
        }

        this.init_listener()
        this.resize( this )
    }
    init_listener(){
        window.addEventListener('resize', () => { this.resize( this ) } )
    }

    clear_background( color = "background" ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.clear_background_2D( color )
                break
        }
    }
    draw_pixel( x, y, color = "white" ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_pixel_2D( x, y, color )
                break
        }
    }
    draw_cursor( x, y, cursor = CURSORS.ARROW, color = "white", alpha = 1 ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_cursor_2D( x, y, cursor, color, alpha )
                break
        }
    }
    draw_grid( offset_x, offset_y ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_grid_2D( offset_x, offset_y )
                break
        }
    }
    draw_point( x, y, stroke_color = "grey", stroke_alpha = 1, fill_color = "dark grey", fill_alpha = 1, radius = 4, stroke_size = 2 ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_point_2D( x, y, stroke_color, stroke_alpha, fill_color, fill_alpha, radius, stroke_size )
                break
        }
    }
    draw_line( start_x, start_y, end_x, end_y, color = "dark grey", alpha = 1, size = 2 ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_line_2D( start_x, start_y, end_x, end_y, color, alpha, size )
                break
        }
    }
    draw_box( top_left_x, top_left_y, bottom_right_x, bottom_right_y, color = "green", alpha  = 1, size = 2 ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_box_2D( top_left_x, top_left_y, bottom_right_x, bottom_right_y, color, alpha, size )
                break
        }
    }
    draw_text( x, y, text, color = "white", size = 6 ){
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_text_2D( x, y, text, color, size )
                break
        }
    }
    draw_player_position( offset_x, offset_y, player = this.mood.player, color = "red" ){
        if( player === null ){ return }
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_player_position_2D( offset_x, offset_y, player, color )
                break
        }
    }
    draw_bsp_tree( offset_x, offset_y, bsp_tree = this.mood.level.bsp_tree ){
        if( bsp_tree === null ){ return }
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_bsp_tree_2D(  offset_x, offset_y, bsp_tree )
                break
        }
    }
    draw_bsp_node( offset_x, offset_y, bsp_node = this.mood.level.bsp_tree.root ){
        if( bsp_node === null ){ return }
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_bsp_node_2D(  offset_x, offset_y, bsp_node )
                break
        }
    }
    draw_sub_sector( offset_x, offset_y, sub_sector ){
        if( sub_sector === null ){ return }
        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.draw_sub_sector_2D(  offset_x, offset_y, sub_sector )
                break
        }
    }

    add_color( color_name, r, g, b ){
        this.colors.push( {
            name : color_name,
            value : [
                this.mood.math_utility.value_range( r, 0, 255 ),
                this.mood.math_utility.value_range( g, 0, 255 ),
                this.mood.math_utility.value_range( b, 0, 255 ),
            ]
        } )
    }
    get_color( color_name, alpha = 1 , has_css = false ){
        let c = [ 0, 60,  130 ]
        let a = this.mood.math_utility.value_range( alpha, 0, 1 )
        for( let i = 0; i < this.colors.length; i++ ){
            if( this.colors[ i ].name === color_name ){ c = this.colors[ i ].value }
        }
        if( a === 1  ){
            return ( has_css ) ? "rgb("+c[ 0 ]+","+c[ 1 ]+","+c[ 2 ]+" )" : c
        }
        c.push( a )
        return ( has_css ) ? "rgba("+c[ 0 ]+","+c[ 1 ]+","+c[ 2 ]+","+c[ 3 ]+" )" : c
    }

    //2d draw function
    clear_background_2D( color ){
        this.context.fillStyle = this.get_color( color, 1, true )
        this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height )
    }
    draw_pixel_2D( x, y, color ){
        this.context.fillStyle = this.get_color( color, 1, true )
        this.context.fillRect( x * this.pixel_scale, y * this.pixel_scale, this.pixel_scale, this.pixel_scale )
    }
    draw_cursor_2D( x, y, cursor, color, alpha ){
        this.context.strokeStyle = this.context.fillStyle = this.get_color( color, alpha, true )
        this.context.fillStyle   = this.context.fillStyle = this.get_color( color, alpha, true )
        this.context.beginPath()
        switch( cursor ){
        case CURSORS.ARROW :
            this.context.moveTo( x, y )
            this.context.lineTo( x + 16, y + 6 )
            this.context.lineTo(x + 6, y + 16 )
            break
        case CURSORS.GRAB :
            this.context.moveTo( x, y - 8 )
            this.context.lineTo( x , y + 8 )
            this.context.moveTo( x- 8, y )
            this.context.lineTo(x + 8, y )
            break
        }
        this.context.stroke()
        this.context.fill()
    }
    draw_point_2D( x, y, stroke_color, stroke_alpha, fill_color, fill_alpha, radius, stroke_size ){
        this.context.strokeStyle = this.get_color( stroke_color, stroke_alpha, true )
        this.context.fillStyle   = this.get_color( fill_color, fill_alpha, true )
        this.context.lineWidth   = stroke_size
        this.context.beginPath()
        this.context.arc( x, y, radius, 0, this.mood.math_utility.pi2, false )
        this.context.stroke()
        this.context.fill()
    }
    draw_line_2D( start_x, start_y, end_x, end_y, color, alpha, size ){
        this.context.beginPath()
        this.context.fillStyle   = "rgba( 0, 0, 0, 0 )"
        this.context.strokeStyle = this.get_color( color, alpha, true )
        this.context.lineWidth   = size
        this.context.moveTo( start_x, start_y )
        this.context.lineTo( end_x, end_y )
        this.context.stroke()
    }
    draw_box_2D( top_left_x, top_left_y, bottom_right_x, bottom_right_y, color, alpha, size ){
        this.context.fillStyle   = "rgba( 0, 0, 0, 0 )"
        this.context.strokeStyle = this.get_color( color, alpha, true )
        this.context.lineWidth   = size
        this.context.strokeRect( top_left_x, top_left_y, bottom_right_x - top_left_x, bottom_right_y - top_left_y )
    }
    draw_text_2D( x, y, text, color = "white", size ){
        this.context.fillStyle   = this.get_color( color, 1, true )
        this.context.font        = size.toString()+"px"
        this.context.fillText( text, x, y )
    }
    draw_player_position_2D( offset_x, offset_y, player, color ){
        let player_position_x      = this.mood.player.position.x * this.mood.editor.grid_scale() - offset_x
        let player_position_y      = this.mood.player.position.y * -1 * this.mood.editor.grid_scale() - offset_y
        let player_look_horizontal = this.mood.math_utility.angle_range( this.mood.player.look_horizontal + 90 )

        this.draw_point( player_position_x, player_position_y, "red", 1,"dark red", 1, 4, 4 )
        this.context.beginPath()
        this.context.lineWidth   = 4
        this.context.strokeStyle = this.get_color( color, 1 )
        this.context.fillStyle   = this.get_color( color, .5 )
        this.context.moveTo( player_position_x, player_position_y )
        this.context.lineTo(
            Math.round( player_position_x + 30 * this.mood.math_utility.lookup_table.cos[ player_look_horizontal ] ),
            Math.round( player_position_y + 30 * this.mood.math_utility.lookup_table.sin[ player_look_horizontal ] )
        )
        this.context.stroke()
    }
    draw_grid_2D( pixel_x_offset, pixel_y_offset ){
        let screen_step_x       = Math.ceil( this.canvas.width / this.mood.editor.ceil_pixel_size() )
        let screen_step_y       = Math.ceil( this.canvas.height / this.mood.editor.ceil_pixel_size() )
        let pos_x_offset        = this.mood.editor.grid_pos.x
        let pos_y_offset        = this.mood.editor.grid_pos.y * -1
        let pixel_grid_x_offset = pixel_x_offset % this.mood.editor.ceil_pixel_size()
        let pixel_grid_y_offset = pixel_y_offset % this.mood.editor.ceil_pixel_size()
        let ceil_x_offset       = Math.floor( pos_x_offset / this.mood.editor.unit_by_ceil )
        let ceil_y_offset       = Math.floor( pos_y_offset / this.mood.editor.unit_by_ceil ) * -1
        let zero_lines          = []

        this.context.beginPath()
        this.context.strokeStyle = "rgba( 120, 120, 120, 1 )"
        this.context.fillStyle   = "rgba( 255, 255, 255, 1 )"
        this.context.lineWidth   = 1
        this.context.font        = "6px"
        this.context.fillText( "x", 30 , 20 )
        this.context.fillText( "y", 20 , 30 )
        for( let x = 0; x <= screen_step_x; x++ ){
            if( x > 1 ){ this.context.fillText( ( x + ceil_x_offset ) * this.mood.editor.unit_by_ceil, x * this.mood.editor.ceil_pixel_size() - pixel_grid_x_offset, 20 ) }
            if( 0 !== Math.ceil( ( x + ceil_x_offset ) * this.mood.editor.unit_by_ceil ) ){
                this.context.moveTo( x * this.mood.editor.ceil_pixel_size() - pixel_grid_x_offset, 0 )
                this.context.lineTo( x * this.mood.editor.ceil_pixel_size() - pixel_grid_x_offset, this.canvas.height )
            }else{
                zero_lines.push( [
                    x * this.mood.editor.ceil_pixel_size() - pixel_grid_x_offset,
                    0,
                    x * this.mood.editor.ceil_pixel_size() - pixel_grid_x_offset,
                    this.canvas.height
                ] )
            }
        }
        for( let y = 0; y <= screen_step_y; y++ ){
            if( y > 1 ){ this.context.fillText( ( y * -1 + ceil_y_offset ) * this.mood.editor.unit_by_ceil, 20, y * this.mood.editor.ceil_pixel_size() - pixel_grid_y_offset ) }
            if( 0 !== Math.ceil( (  y * -1 + ceil_y_offset ) * this.mood.editor.unit_by_ceil ) ){
                this.context.moveTo( 0,                  y * this.mood.editor.ceil_pixel_size() - pixel_grid_y_offset )
                this.context.lineTo( this.canvas.width, y * this.mood.editor.ceil_pixel_size() - pixel_grid_y_offset )
            }else{
                zero_lines.push( [
                    0,
                    y * this.mood.editor.ceil_pixel_size() - pixel_grid_y_offset,
                    this.canvas.width,
                    y * this.mood.editor.ceil_pixel_size() - pixel_grid_y_offset
                ] )
            }
        }
        this.context.stroke()

        if( zero_lines.length > 0 ){
            this.context.beginPath()
            this.context.lineWidth   = 2
            this.context.strokeStyle = "rgba( 120, 0 , 0, 1 )"
            zero_lines.forEach( ( p ) => {
                this.context.moveTo( p[ 0 ], p[ 1 ] )
                this.context.lineTo( p[ 2 ], p[ 3 ] )
            } )
            this.context.stroke()
        }
    }
    draw_bsp_tree_2D( offset_x, offset_y, bsp_tree ){
        bsp_tree.render_node( this, offset_x, offset_y, this.mood.player )
    }
    draw_bsp_node_2D( offset_x, offset_y, bsp_node ){

        this.draw_box_2D(
            bsp_node.right_bound_box.top_left.x * this.mood.editor.grid_scale() - offset_x,
            bsp_node.right_bound_box.top_left.y * -1 * this.mood.editor.grid_scale() - offset_y,
            bsp_node.right_bound_box.bottom_right.x * this.mood.editor.grid_scale() - offset_x,
            bsp_node.right_bound_box.bottom_right.y * -1 * this.mood.editor.grid_scale() - offset_y,
            "dark green",
            .5,
            2
        )

        this.draw_box_2D(
            bsp_node.left_bound_box.top_left.x * this.mood.editor.grid_scale() - offset_x,
            bsp_node.left_bound_box.top_left.y * -1 * this.mood.editor.grid_scale() - offset_y,
            bsp_node.left_bound_box.bottom_right.x * this.mood.editor.grid_scale() - offset_x,
            bsp_node.left_bound_box.bottom_right.y * -1 * this.mood.editor.grid_scale() - offset_y,
            "dark red",
            .5,
            2
        )

        this.draw_line_2D(
            bsp_node.partition_line.start.x * this.mood.editor.grid_scale() - offset_x,
            bsp_node.partition_line.start.y * -1 * this.mood.editor.grid_scale() - offset_y,
            bsp_node.partition_line.end.x * this.mood.editor.grid_scale() - offset_x,
            bsp_node.partition_line.end.y * -1 *this.mood.editor.grid_scale() - offset_y,
            "dark yellow",
            1,
            2
        )

    }
    draw_sub_sector_2D( offset_x, offset_y, sub_sector ){
        sub_sector.segments.forEach( ( segment ) => {
            this.draw_line(
                segment.edge.vertices[ 0 ].x * this.mood.editor.grid_scale() - offset_x,
                segment.edge.vertices[ 0 ].y * -1 * this.mood.editor.grid_scale() - offset_y,
                segment.edge.vertices[ 1 ].x * this.mood.editor.grid_scale() - offset_x,
                segment.edge.vertices[ 1 ].y * -1 * this.mood.editor.grid_scale() - offset_y,
                "red"
            )
        } )
    }

    //resize
    resize( renderer ){
        renderer.canvas.width      = window.visualViewport.width
        renderer.canvas.height     = window.visualViewport.height
        renderer.internal_width    = Math.round( renderer.canvas.width / renderer.pixel_scale )
        renderer.internal_height   = Math.round( renderer.canvas.height / renderer.pixel_scale )
        renderer.internal_width_2  = renderer.internal_width / 2
        renderer.internal_height_2 = renderer.internal_height / 2
    }
}
class Camera{}
class Level{
    constructor(){
        this.name     = 'void'
        this.vertices = []
        this.edges    = []
        this.segments = []
        this.sectors  = []
        this.size     = new Int2DVertex( 1,1 )
        this.bsp_tree = null
        this.boundary = [
            new Int2DVertex( 0,0 ),
            new Int2DVertex( 1,1 ),
        ]
        this.player_start = {
            position         : new Int3DVertex( 1,1, 20 ),
            horizontal_angle : 0,
            vertical_angle   : 0
        }
    }
    load_from_wad( wad_loader, map_name ){
        let map_data = wad_loader.get_map_data( map_name )
        this.name         = map_name
        this.vertices     = map_data.get_vertices()
        this.edges        = map_data.get_edges()
        this.segments     = [] //map_data.get_segments()
        this.sectors      = []
        this.size         = map_data.get_size()
        this.boundary     = map_data.get_boundary()
        this.bsp_tree     = map_data.get_bsp_tree()
        this.player_start = map_data.get_player_start()
    }
    spawn_player(){
        return new Player(
            this.player_start.position,
            this.player_start.horizontal_angle,
            this.player_start.vertical_angle
        )
    }
}
class InputManager{
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

class Mood{
    constructor( canvas, options = {} ){
        let render_mode   = ( options.render !== undefined ) ? options.render : '2D'
        let pixel_scale   = ( options.scale !== undefined ) ? options.scale : 4
        let debug         = ( options.debug !== undefined ) ? options.debug : false

        this.game_state   = GAME_STATES.EDITOR
        this.math_utility = new MathUtility()
        this.renderer     = new Renderer( this, canvas, render_mode, pixel_scale )
        this.debbuger     = new Debugger( this, debug )
        this.inputs       = new InputManager( this )
        this.wad_loader   = new WadLoader( this,[ './wads/DOOM1.WAD' ] )
        this.level        = new Level()

        this.level.load_from_wad( this.wad_loader, 'E1M1' )
        this.player       = this.level.spawn_player()

        //TODO :: make objects
        this.game         = {
            update : () => {
                if( this.inputs.mouse_lock ){
                    this.player.look_horizontal += Math.round( this.inputs.mouse_movements.x / 8 )
                }else{
                    if( this.inputs.input_status.has( "look_left_down" ) ){ this.player.look_horizontal  -= 2 }
                    if( this.inputs.input_status.has( "look_right_down" ) ){ this.player.look_horizontal += 2 }
                }
                this.player.look_horizontal = this.math_utility.angle_range( this.player.look_horizontal )

                let delta_x = Math.round( this.math_utility.lookup_table.sin[ this.player.look_horizontal ] * 6.0 )
                let delta_y = Math.round( this.math_utility.lookup_table.cos[ this.player.look_horizontal ] * 6.0 )

                if( this.inputs.mouse_lock ){
                    this.player.look_vertical -= Math.round( this.inputs.mouse_movements.y / 16 )
                }else{
                    if( this.inputs.input_status.has( "look_up_down" ) ){ this.player.look_vertical -= 1 }
                    if( this.inputs.input_status.has( "look_down_down" ) ){ this.player.look_vertical  += 1 }
                }
                this.player.look_vertical = this.math_utility.angle_range( this.player.look_vertical, -90, 90, false )

                if(
                    this.inputs.input_status.has( "forward_down" )
                    && ! this.inputs.input_status.has( "look_up_down" )
                ){
                    this.player.position.x -= delta_x
                    this.player.position.y -= delta_y
                }
                if(
                    this.inputs.input_status.has( "backward_down" )
                    && ! this.inputs.input_status.has( "look_down_down" )
                ){
                    this.player.position.x += delta_x
                    this.player.position.y += delta_y
                }
                if(
                    this.inputs.input_status.has( "strafe_right_down" )
                    && ! this.inputs.input_status.has( "look_right_down" )
                ){
                    this.player.position.x -= delta_y
                    this.player.position.y += delta_x
                }
                if(
                    this.inputs.input_status.has( "strafe_left_down" )
                    && ! this.inputs.input_status.has( "look_left_down" )
                ){
                    this.player.position.x += delta_y
                    this.player.position.y -= delta_x
                }
                if( this.inputs.input_status.has( "up_down" ) ){ this.player.position.z += 4 }
                if( this.inputs.input_status.has( "down_down" ) ){ this.player.position.z -= 4 }

                //this.player.position.x = this.math_utility.value_range( this.player.position.y, 0, this.level.size.x  )
                //this.player.position.y = this.math_utility.value_range( this.player.position.y, 0, this.level.size.x  )
            },
            render : ( renderer ) => {
                renderer.clear_background()
                //TODO :: redo
                //sort sector by distance
                for( let i = 0; i < this.level.sectors.length - 1 ; i++ ){
                    for( let i2 = 0; i2 < this.level.sectors.length - i - 1; i2++ ){
                        if( this.level.sectors[ i2 ].distance < this.level.sectors[ i2+1 ].distance ){
                            let swap              = this.level.sectors[ i2 ]
                            this.level.sectors[ i2 ]   = this.level.sectors[ i2+1 ]
                            this.level.sectors[ i2+1 ] = swap
                        }
                    }
                }
                // draw sector
                for( let sector_index = 0; sector_index < this.level.sectors.length; sector_index++ ){
                    this.level.sectors[ sector_index ].draw_sector( this.player, renderer )
                }
            }
        }
        this.editor       = new Editor( this )

    }
    run(){
        this.time = {
            execution_start   : window.performance.now(),
            target_frame_rate : 60,
            unscaledTime      : 0,
            unscaledDeltaTime : 0,
            timeScale         : 1,
            time              : 0,
            deltaTime         : 0,
            maximumDeltaTime  : 0.3333333,
            frame_count       : 0,
            last_frame_count  : 0,
            last_second       : 0,
        }

        this.mood_loop( this )
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    mood_loop( mood ){
        let slice          = ( 1 / mood.time.target_frame_rate ) - 0.005
        let accumulator    = ( performance.now() / 1000 ) - mood.time.unscaledTime
        let current_second = Math.floor( performance.now() / 1000 )

        while( accumulator >= slice ){
            mood.time.unscaledDeltaTime = ( performance.now() / 1000 ) - mood.time.unscaledTime
            mood.time.unscaledTime      += mood.time.unscaledDeltaTime
            let deltaT = mood.time.unscaledDeltaTime
            if( deltaT > mood.time.maximumDeltaTime ){ deltaT = mood.time.maximumDeltaTime }
            mood.time.deltaTime = deltaT * mood.time.timeScale
            mood.time.time      += mood.time.deltaTime
            mood.inputs.resolve_keys()
            mood.update_game_state()
            mood.update()
            mood.debbuger.update()
            mood.inputs.clear_mouse_movements()
            accumulator -= slice
            mood.time.frame_count++ // what what what ???
        }

        mood.render()
        mood.debbuger.render()

        if( mood.time.last_second < current_second ){
            mood.time.last_second       = current_second
            mood.time.last_frame_count = mood.time.frame_count
            mood.time.frame_count      = 0
        }

        requestAnimationFrame( () => { mood.mood_loop( mood ) }  )
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    update_game_state(){
        switch ( this.game_state ){
            case GAME_STATES.GAME :
                if( this.inputs.input_status.has( "editor_mode_release" ) ){ this.game_state = GAME_STATES.EDITOR }
                break
            case GAME_STATES.EDITOR :
                if( this.inputs.input_status.has( "game_mode_release" ) ){ this.game_state = GAME_STATES.GAME }
                break
        }
    }

    update(){
        switch ( this.game_state ){
            case GAME_STATES.GAME :
                this.game.update()
                break
            case GAME_STATES.EDITOR :
                this.editor.update()
                break
        }
    }

    render(){
        switch ( this.game_state ){
            case GAME_STATES.GAME :
                this.game.render( this.renderer )
                break
            case GAME_STATES.EDITOR :
                this.editor.render( this.renderer )
                break
        }
    }
}

window.onload = ()=>{

    let mood = new Mood(
        document.getElementById("mood"),
        {
            render : "2D",
            scale  : 4,
            debug  : true,
        }
    )

    mood.run()

}