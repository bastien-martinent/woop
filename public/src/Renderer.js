import {CURSORS} from "./const.js"

export default class Renderer{
    constructor( mood, canvas, render_mode = '2D', field_of_view= 90, pixel_scale = 8 ){
        this.mood           = mood
        this.canvas         = canvas
        this.render_mode    = render_mode
        this.horisontal_fov = field_of_view
        this.pixel_scale    = pixel_scale
        this.colors         = {
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
        this.data_sets      = {}

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
        this.canvas.width      = window.visualViewport.width
        this.canvas.height     = window.visualViewport.height
        this.internal_width    = Math.round( this.canvas.width / this.pixel_scale )
        this.internal_height   = Math.round( this.canvas.height / this.pixel_scale )
        this.internal_width_2  = this.internal_width / 2
        this.internal_height_2 = this.internal_height / 2
        this.internal_width_2  = this.internal_width / 2
        this.internal_height_2 = this.internal_height / 2
        this.aspect_ratio      = this.internal_width / this.internal_height
        this.vertical_fov      = ( this.horisontal_fov * .5 ) / this.aspect_ratio
    }

    //
    update_render_variables( set_name = 'common', data = {} ){
        if( typeof this.data_sets[ set_name ] === "undefined" ){
            this.data_sets[ set_name ] = {}
        }
        Object.entries( data ).forEach( ( [ key, value ] ) => {
            this.data_sets[ set_name ][ key ] = value
        })
    }
    get_from_data_sets( set_name = 'common', var_name ){
        if(
            typeof this.data_sets[ set_name ] === "undefined"
            || typeof this.data_sets[ set_name ][ var_name ] === "undefined"
        ){ return null }
        return this.data_sets[ set_name ][ var_name ]
    }

    //common draw function
    clear_background = ( color = "background" ) => {
        if( typeof this[ 'clear_background_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' clear_background function.' )
            return
        }
        this[ 'clear_background_'+this.render_mode ]( color )
    }
    draw_pixel = ( x, y, color = "white" ) => {
        if( typeof this[ 'draw_pixel_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_pixel function.' )
            return
        }
        this[ 'draw_pixel_'+this.render_mode ]( x, y, color )
    }
    draw_text = ( x, y, text, color = "white", size = 6 ) => {
        if( typeof this[ 'draw_text_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_text function.' )
            return
        }
        this[ 'draw_text_'+this.render_mode ]( x, y, text, color, size )

    }
    draw_cursor = ( x, y, cursor = CURSORS.ARROW, color = "white", alpha = 1 ) => {
        if( typeof this[ 'draw_cursor_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_cursor function.' )
            return
        }
        this[ 'draw_cursor_'+this.render_mode ]( x, y, cursor, color, alpha )
    }

    //editor draw function
    draw_editor_grid = ( offset_x, offset_y ) => {
        if( typeof this[ 'draw_editor_grid_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_editor_grid function.' )
            return
        }
        this[ 'draw_editor_grid_'+this.render_mode ]( offset_x, offset_y )
    }
    draw_editor_player = ( player = this.mood.player, color = "red" ) => {
        if( typeof this[ 'draw_editor_player_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_editor_player function.' )
            return
        }
        this[ 'draw_editor_player_'+this.render_mode ]( player, color )
    }
    draw_editor_sector_in_field_of_view = ( bsp_tree = this.mood.level.bsp_tree ) => {
        if( typeof this[ 'draw_editor_sector_in_field_of_view_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_editor_sector_in_field_of_view function.' )
            return
        }
        this[ 'draw_editor_sector_in_field_of_view_'+this.render_mode ]( bsp_tree )
    }
    draw_editor_bound_box = ( bound_box ) => {
        if( typeof this[ 'draw_editor_bound_box_'+this.render_mode ] !== "function" ){
            console.log( 'no ' + this.render_mode +' draw_editor_bound_box function.' )
            return
        }
        this[ 'draw_editor_bound_box_'+this.render_mode ]( bound_box )
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
        if( typeof this.colors[ color_name ] === "undefined" ) {
            this.colors[color_name] = [
                this.mood.math_utility.value_range(r, 0, 255),
                this.mood.math_utility.value_range(g, 0, 255),
                this.mood.math_utility.value_range(b, 0, 255),
            ]
        }
    }
    get_color( color, alpha = 1 , has_css = false ){
        let c = [ 0, 60,  130 ]
        let a = this.mood.math_utility.value_range( alpha, 0, 1 )
        if( typeof this.colors[ color ] !== "undefined" ) {
            c = this.colors[ color ]
        }
        if( a === 1  ){
            return ( has_css ) ? "rgb("+c[ 0 ]+","+c[ 1 ]+","+c[ 2 ]+" )" : c
        }
        return ( has_css ) ? "rgba("+c[ 0 ]+","+c[ 1 ]+","+c[ 2 ]+","+a+" )" : c
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
    draw_editor_player_2D( player, color ){
        let offset_x               = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y               = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale             = this.get_from_data_sets( "editor", "grid_scale" )
        let player_position_x      = this.mood.player.position.x * grid_scale - offset_x
        let player_position_y      = this.mood.player.position.y * -1 * grid_scale - offset_y
        let player_look_horizontal = this.mood.math_utility.angle_range( ( this.mood.player.look_horizontal * -1 ) )
        let fov_line_1             = this.mood.math_utility.angle_range( ( this.mood.player.look_horizontal * -1 ) + ( this.horisontal_fov / 2 ) )
        let fov_line_2             = this.mood.math_utility.angle_range( ( this.mood.player.look_horizontal * -1 ) - ( this.horisontal_fov / 2 ) )

        //player position
        this.draw_point_2D( player_position_x, player_position_y, color, 1,color, 1, 4, 4 )

        //direction line
        this.context.beginPath()
        this.context.lineWidth   = 4
        this.context.strokeStyle = this.get_color( color, 1, true )
        this.context.fillStyle   = this.get_color( color, .5, true )
        this.context.moveTo(
            Math.round( player_position_x + 4 * this.mood.math_utility.lookup_table.cos[ player_look_horizontal ] ),
            Math.round( player_position_y + 4 * this.mood.math_utility.lookup_table.sin[ player_look_horizontal ] )
        )
        this.context.lineTo(
            Math.round( player_position_x + 20 * this.mood.math_utility.lookup_table.cos[ player_look_horizontal ] ),
            Math.round( player_position_y + 20 * this.mood.math_utility.lookup_table.sin[ player_look_horizontal ] )
        )
        this.context.stroke()

        //field of view lines
        this.context.lineWidth   = 1
        this.context.strokeStyle = this.get_color("green", 1, true )
        this.context.fillStyle   = this.get_color( "green", .5, true )
        this.context.moveTo(
            Math.round( player_position_x + 4 * this.mood.math_utility.lookup_table.cos[ fov_line_1 ] ),
            Math.round( player_position_y + 4 * this.mood.math_utility.lookup_table.sin[ fov_line_1 ] )
        )
        this.context.lineTo(
            Math.round( player_position_x + 500 * this.mood.math_utility.lookup_table.cos[ fov_line_1 ] ),
            Math.round( player_position_y + 500 * this.mood.math_utility.lookup_table.sin[ fov_line_1 ] )
        )
        this.context.moveTo(
            Math.round( player_position_x + 4 * this.mood.math_utility.lookup_table.cos[ fov_line_2 ] ),
            Math.round( player_position_y + 4 * this.mood.math_utility.lookup_table.sin[ fov_line_2 ] )
        )
        this.context.lineTo(
            Math.round( player_position_x + 500 * this.mood.math_utility.lookup_table.cos[ fov_line_2 ] ),
            Math.round( player_position_y + 500 * this.mood.math_utility.lookup_table.sin[ fov_line_2 ] )
        )
        this.context.stroke()
    }
    draw_editor_grid_2D( pixel_x_offset, pixel_y_offset ){
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
    draw_editor_sector_in_field_of_view_2D( bsp_tree ){
        bsp_tree.render_node( this.mood.player, this.draw_sub_sector_2D )
    }
    draw_bsp_node_2D = ( bsp_node ) => {
        let offset_x   = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y   = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale = this.get_from_data_sets( "editor", "grid_scale" )

        this.draw_box_2D(
            bsp_node.right_bound_box.top_left.x * grid_scale - offset_x,
            bsp_node.right_bound_box.top_left.y * -1 * grid_scale - offset_y,
            bsp_node.right_bound_box.bottom_right.x * grid_scale - offset_x,
            bsp_node.right_bound_box.bottom_right.y * -1 * grid_scale - offset_y,
            "dark green",
            .5,
            2
        )

        this.draw_box_2D(
            bsp_node.left_bound_box.top_left.x * grid_scale - offset_x,
            bsp_node.left_bound_box.top_left.y * -1 * grid_scale - offset_y,
            bsp_node.left_bound_box.bottom_right.x * grid_scale - offset_x,
            bsp_node.left_bound_box.bottom_right.y * -1 * grid_scale - offset_y,
            "dark red",
            .5,
            2
        )

        this.draw_line_2D(
            bsp_node.partition_line.start.x * grid_scale - offset_x,
            bsp_node.partition_line.start.y * -1 * grid_scale - offset_y,
            bsp_node.partition_line.end.x * grid_scale - offset_x,
            bsp_node.partition_line.end.y * -1 * grid_scale - offset_y,
            "dark yellow",
            1,
            2
        )
    }
    draw_editor_bound_box_2D = ( bound_box ) => {
        let offset_x   = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y   = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale = this.get_from_data_sets( "editor", "grid_scale" )
        this.draw_box_2D(
            bound_box.top_left.x * grid_scale - offset_x,
            bound_box.top_left.y * -1 * grid_scale - offset_y,
            bound_box.bottom_right.x * grid_scale - offset_x,
            bound_box.bottom_right.y * -1 * grid_scale - offset_y,
            "dark green",
            .5,
            2
        )

    }
    draw_sub_sector_2D = ( sub_sector ) => {
        let offset_x   = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y   = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale = this.get_from_data_sets( "editor", "grid_scale" )
        sub_sector.segments.forEach( ( segment ) => {
            this.add_color(
                sub_sector.id,
                this.mood.math_utility.range_random_int(),
                this.mood.math_utility.range_random_int(),
                this.mood.math_utility.range_random_int()
            )
            this.draw_line(
                segment.edge.vertices[ 0 ].x * grid_scale - offset_x,
                segment.edge.vertices[ 0 ].y * -1 * grid_scale - offset_y,
                segment.edge.vertices[ 1 ].x * grid_scale - offset_x,
                segment.edge.vertices[ 1 ].y * -1 * grid_scale - offset_y,
                sub_sector.id
            )
        } )
    }
}