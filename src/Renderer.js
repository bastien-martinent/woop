import {CURSORS} from "./const.js"
import WoopMath from "./WoopMath.js"
import ScreenSpace from "./ScreenSpace.js"

export default class Renderer{
    constructor( woop, canvas, render_mode, field_of_view, pixel_scale ){
        this.woop                = woop
        this.canvas              = canvas
        this.render_mode         = render_mode
        this.fov                 = field_of_view
        this.pixel_scale         = pixel_scale
        this.data_sets           = {}
        this.screen_space        = null
        this.colors              = {
            "black"         : [ 33, 33, 33 ],
            "blacker black" : [ 0, 0, 0 ],
            "white"         : [ 255, 255, 255 ],
            "lite grey"     : [ 210, 210, 210 ],
            "grey"          : [ 150, 150, 150 ],
            "dark grey"     : [ 100, 100, 100 ],
            "yellow"        : [ 255, 255, 0 ],
            "dark yellow"   : [ 160, 160, 0 ],
            "green"         : [ 0, 255, 0 ],
            "dark green"    : [ 0, 160, 0 ],
            "cyan"          : [ 0, 255, 255 ],
            "dark cyan"     : [ 0, 160, 160 ],
            "red"           : [ 200, 0, 0 ],
            "dark red"      : [ 150, 0, 0 ],
            "blue"          : [ 0, 0, 200 ],
            "dark blue"     : [ 0, 0, 130 ],
            "brown"         : [ 160, 100, 0 ],
            "dark brown"    : [ 110, 50,  0 ],
            "background"    : [ 0, 60,  130 ],
        }

        switch ( this.render_mode ) {
            case "2D" :
            default :
                this.context = canvas.getContext( "2d" )
                break
        }

        this.init_listener()
        this.resize()
    }

    //screen related events
    init_listener(){
        window.addEventListener('resize', () => { this.resize() } )
    }

    //resize
    resize = () => {
        this.canvas.width         = window.visualViewport.width
        this.canvas.height        = window.visualViewport.height
        this.internal_width       = Math.round( this.canvas.width / this.pixel_scale )
        this.internal_height      = Math.round( this.canvas.height / this.pixel_scale )
        this.demi_internal_width  = this.internal_width / 2
        this.demi_internal_height = this.internal_height / 2
        this.horisontal_fov       =  this.fov
        this.demi_horisontal_fov  = this.horisontal_fov / 2
        /* maybe you can find a way to adjust fov from desired fov and screen aspect ratio
            FOV_Horizontal = 2 * atan(W/2/f) = 2 * atan2(W/2, f)  radians
            FOV_Vertical   = 2 * atan(H/2/f) = 2 * atan2(H/2, f)  radians
            FOV_Diagonal   = 2 * atan2(sqrt(W^2 + H^2)/2, f)    radians
            this.aspect_ratio = this.internal_width / this.internal_height
            this.vertical_fov = WoopMath.degrees_to_radians( 2 * Math.atan2( this.demi_internal_height, this.fov ) )
            this.vertical_fov = this.vertical_fov / 2
        */
        this.screen_distance      = this.demi_internal_width / Math.tan( WoopMath.degrees_to_radians( this.demi_horisontal_fov ) )
        this.screen_space         = new ScreenSpace( this.internal_width, this.internal_height )
        WoopMath.init( this )
    }

    //useful dataset from editor or game
    update_render_variables = ( set_name = 'common', data = {} ) => {
        if( typeof this.data_sets[ set_name ] === "undefined" ){
            this.data_sets[ set_name ] = {}
        }
        Object.entries( data ).forEach( ( [ key, value ] ) => {
            this.data_sets[ set_name ][ key ] = value
        })
    }
    get_from_data_sets = ( set_name = 'common', var_name ) => {
        if(
            typeof this.data_sets[ set_name ] === "undefined"
            || typeof this.data_sets[ set_name ][ var_name ] === "undefined"
        ){ return null }
        return this.data_sets[ set_name ][ var_name ]
    }

    //color stuff
    add_color( color_name, r, g, b ){
        if( typeof this.colors[ color_name ] === "undefined" ) {
            this.colors[color_name] = [
                WoopMath.value_range( r, 0, 255 ),
                WoopMath.value_range( g, 0, 255 ),
                WoopMath.value_range( b, 0, 255 ),
            ]
        }
    }
    get_color( color, alpha = 1 , has_css = false ){
        let a = WoopMath.value_range( alpha, 0, 1 )
        if( typeof this.colors[ color ] === "undefined" ) {
            this.add_color(
                color,
                WoopMath.random_int_range( 100, 255 ),
                WoopMath.random_int_range( 100, 255 ),
                WoopMath.random_int_range( 100, 255 )
            )
        }
        let c = this.colors[ color ]
        if( a === 1  ){
            return ( has_css ) ? "rgb("+c[ 0 ]+","+c[ 1 ]+","+c[ 2 ]+" )" : c
        }
        return ( has_css ) ? "rgba("+c[ 0 ]+","+c[ 1 ]+","+c[ 2 ]+","+a+" )" : c
    }

    //draw interface
    draw = ( what, args = [] ) => {
        if( typeof this[ 'draw_'+what+'_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_'+what+' function.' )
            return
        }
        this[  'draw_'+what+'_'+this.render_mode ]( ...args )
    }

    //common draw function
    draw_background = ( color = "background" ) => {
        this.draw( 'background', [ color ] )
    }
    draw_text = ( x, y, text, color = "white", size = 6 ) => {
        this.draw( 'text', [ x, y, text, color, size ] )
    }
    draw_cursor = ( x, y, cursor = CURSORS.ARROW, color = "white", alpha = 1 ) => {
        this.draw( 'cursor', [ x, y, cursor, color, alpha ] )
    }

    //editor draw function
    draw_editor_point( x, y, stroke_color = "grey", stroke_alpha = 1, fill_color = "dark grey", fill_alpha = 1, radius = 4, stroke_size = 2 ){
        this.draw( 'editor_point', [ x, y, stroke_color, stroke_alpha, fill_color, fill_alpha, radius, stroke_size ] )
    }
    draw_editor_line( start_x, start_y, end_x, end_y, color = "dark grey", alpha = 1, size = 2 ){
        this.draw( 'editor_line', [ start_x, start_y, end_x, end_y, color, alpha, size ] )
    }
    draw_editor_box( top_left_x, top_left_y, bottom_right_x, bottom_right_y, color = "green", alpha  = 1, size = 2 ){
        this.draw( 'editor_box', [ top_left_x, top_left_y, bottom_right_x, bottom_right_y, color, alpha, size ] )
    }
    draw_editor_grid = () => {
        this.draw( 'editor_grid', [] )
    }
    draw_editor_player = ( player = this.woop.player, color = "red" ) => {
        this.draw( 'editor_player', [ player, color ] )
    }
    draw_editor_bound_box = ( bound_box ) => {
        this.draw( 'editor_bound_box', [ bound_box ] )
    }
    draw_editor_sub_sector = ( sub_sector ) => {
        this.draw( 'editor_sub_sector', [ sub_sector ] )
    }
    draw_bsp_nodes = ( bsp_node = this.woop.level.bsp_tree.root ) => {
        this.draw( 'editor_bsp_nodes', [ bsp_node ] )
    }
    draw_editor_sector_in_field_of_view = ( bsp_tree = this.woop.level.bsp_tree ) => {
        this.draw( 'editor_sector_in_field_of_view', [ bsp_tree ] )
    }

    //game draw function
    draw_game_pixel = ( x, y, color = "white", alpha = 1 ) => {
        this.draw( 'game_pixel', [ x, y, color, alpha] )
    }
    draw_game_line = ( start_x, start_y, end_x, end_y, texture, light ) => {
        this.draw( 'game_line', [ start_x, start_y, end_x, end_y, texture, light ] )
    }
    draw_game_vertical_line = (x, start_y, end_y, texture = 'default', light = 50  ) => {
        this.draw( 'game_vertical_line', [ x, start_y, end_y, texture, light ] )
    }
    draw_game_edge = ( segment, angle_start, x_star, x_end, range_x_star, range_x_end ) => {
        this.draw( 'game_edge', [ segment, angle_start, x_star, x_end, range_x_star, range_x_end ] )
    }
    draw_game_sector_in_field_of_view = ( bsp_tree = this.woop.level.bsp_tree ) => {
        this.draw( 'game_sector_in_field_of_view', [ bsp_tree ] )
    }
    draw_game_sub_sector = ( sub_sector ) => {
        this.draw( 'game_sub_sector', [ sub_sector ] )
    }

}