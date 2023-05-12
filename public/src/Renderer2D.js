import {CURSORS} from "./const.js"
import WoopMath from "./WoopMath.js"
import Renderer from "./Renderer.js"

export default class Renderer2D extends Renderer{

    constructor( woop, canvas, field_of_view, pixel_scale ) {
        super( woop, canvas, '2D', field_of_view, pixel_scale )
    }

    //common function
    draw_background_2D = ( color ) => {
        this.context.fillStyle = this.get_color( color, 1, true )
        this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height )
    }
    draw_cursor_2D = ( x, y, cursor, color, alpha ) => {
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

    //editor function
    draw_editor_point_2D = ( x, y, stroke_color, stroke_alpha, fill_color, fill_alpha, radius, stroke_size ) => {
        let offset_x               = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y               = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale             = this.get_from_data_sets( "editor", "grid_scale" )
        this.context.strokeStyle = this.get_color( stroke_color, stroke_alpha, true )
        this.context.fillStyle   = this.get_color( fill_color, fill_alpha, true )
        this.context.lineWidth   = stroke_size
        this.context.beginPath()
        this.context.arc( x * grid_scale - offset_x , y * -1 * grid_scale - offset_y, radius, 0, WoopMath.pi2 )
        this.context.stroke()
        this.context.fill()
    }
    draw_editor_line_2D = ( start_x, start_y, end_x, end_y, color, alpha, size ) => {
        let offset_x               = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y               = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale             = this.get_from_data_sets( "editor", "grid_scale" )
        this.context.beginPath()
        this.context.fillStyle   = "rgba( 0, 0, 0, 0 )"
        this.context.strokeStyle = this.get_color( color, alpha, true )
        this.context.lineWidth   = size
        this.context.moveTo( start_x * grid_scale - offset_x, start_y * -1 * grid_scale - offset_y )
        this.context.lineTo( end_x * grid_scale - offset_x , end_y * -1 * grid_scale - offset_y )
        this.context.stroke()
    }
    draw_editor_box_2D = ( top_left_x, top_left_y, bottom_right_x, bottom_right_y, color, alpha, size ) => {
        let offset_x               = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y               = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale             = this.get_from_data_sets( "editor", "grid_scale" )
        this.context.fillStyle   = "rgba( 0, 0, 0, 0 )"
        this.context.strokeStyle = this.get_color( color, alpha, true )
        this.context.lineWidth   = size
        this.context.strokeRect(
            top_left_x * grid_scale - offset_x,
            top_left_y * -1 * grid_scale - offset_y,
            ( bottom_right_x * grid_scale - offset_x ) - ( top_left_x * grid_scale - offset_x ),
            ( bottom_right_y * -1 * grid_scale - offset_y ) - ( top_left_y * -1 * grid_scale - offset_y )
        )
    }
    draw_text_2D = ( x, y, text, color = "white", size ) => {
        this.context.fillStyle   = this.get_color( color, 1, true )
        this.context.font        = size.toString()+"px Arial"
        this.context.fillText( text, x, y )
    }
    draw_editor_player_2D = ( player, color ) => {
        let offset_x               = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y               = this.get_from_data_sets( "editor", "pixel_y_offset" )
        let grid_scale             = this.get_from_data_sets( "editor", "grid_scale" )
        let player_position_x      = this.woop.player.position.x * grid_scale - offset_x
        let player_position_y      = this.woop.player.position.y * -1 * grid_scale - offset_y
        let player_horizontal_angle = WoopMath.angle_range( ( this.woop.player.horizontal_angle * -1 ) )
        let fov_line_1             = WoopMath.angle_range( ( this.woop.player.horizontal_angle * -1 ) + ( this.horisontal_fov / 2 ) )
        let fov_line_2             = WoopMath.angle_range( ( this.woop.player.horizontal_angle * -1 ) - ( this.horisontal_fov / 2 ) )

        //player position
        this.draw_editor_point_2D( this.woop.player.position.x, this.woop.player.position.y, color, 1, color, .5, 4, 1 )

        //direction line
        this.context.beginPath()
        this.context.lineWidth   = 4
        this.context.strokeStyle = this.get_color( color, 1, true )
        this.context.fillStyle   = this.get_color( color, .5, true )
        this.context.moveTo(
            Math.round( player_position_x + 4 * WoopMath.lookup_cos( player_horizontal_angle ) ),
            Math.round( player_position_y + 4 * WoopMath.lookup_sin( player_horizontal_angle ) )
        )
        this.context.lineTo(
            Math.round( player_position_x + 20 * WoopMath.lookup_cos( player_horizontal_angle ) ),
            Math.round( player_position_y + 20 * WoopMath.lookup_sin( player_horizontal_angle ) )
        )
        this.context.stroke()

        //field of view lines
        this.context.lineWidth   = 1
        this.context.strokeStyle = this.get_color("green", 1, true )
        this.context.fillStyle   = this.get_color( "green", .5, true )
        this.context.beginPath()
        this.context.moveTo(
            Math.round( player_position_x + 4 * WoopMath.lookup_cos( fov_line_1 ) ),
            Math.round( player_position_y + 4 * WoopMath.lookup_sin( fov_line_1 ) )
        )
        this.context.lineTo(
            Math.round( player_position_x + 500 * WoopMath.lookup_cos( fov_line_1 ) ),
            Math.round( player_position_y + 500 * WoopMath.lookup_sin( fov_line_1 ) )
        )
        this.context.stroke()

        this.context.beginPath()
        this.context.strokeStyle = this.get_color("green", 1, true )
        this.context.fillStyle   = this.get_color( "green", .5, true )
        this.context.moveTo(
            Math.round( player_position_x + 4 * WoopMath.lookup_cos( fov_line_2 ) ),
            Math.round( player_position_y + 4 * WoopMath.lookup_sin( fov_line_2 ) )
        )
        this.context.lineTo(
            Math.round( player_position_x + 500 * WoopMath.lookup_cos( fov_line_2 ) ),
            Math.round( player_position_y + 500 * WoopMath.lookup_sin( fov_line_2 ) )
        )
        this.context.stroke()
    }
    draw_editor_grid_2D = () => {
        let offset_x   = this.get_from_data_sets( "editor", "pixel_x_offset" )
        let offset_y   = this.get_from_data_sets( "editor", "pixel_y_offset" )

        let screen_step_x       = Math.ceil( this.canvas.width / this.woop.editor.ceil_pixel_size() )
        let screen_step_y       = Math.ceil( this.canvas.height / this.woop.editor.ceil_pixel_size() )
        let pos_x_offset        = this.woop.editor.grid_pos.x
        let pos_y_offset        = this.woop.editor.grid_pos.y * -1
        let pixel_grid_x_offset = offset_x % this.woop.editor.ceil_pixel_size()
        let pixel_grid_y_offset = offset_y % this.woop.editor.ceil_pixel_size()
        let ceil_x_offset       = Math.floor( pos_x_offset / this.woop.editor.unit_by_ceil )
        let ceil_y_offset       = Math.floor( pos_y_offset / this.woop.editor.unit_by_ceil ) * -1
        let zero_lines          = []

        this.context.beginPath()
        this.context.strokeStyle = "rgba( 120, 120, 120, 1 )"
        this.context.fillStyle   = "rgba( 255, 255, 255, 1 )"
        this.context.lineWidth   = 1
        this.context.font        = "6px"
        this.context.fillText( "x", 30 , 20 )
        this.context.fillText( "y", 20 , 30 )
        for( let x = 0; x <= screen_step_x; x++ ){
            if( x > 1 ){ this.context.fillText( ( x + ceil_x_offset ) * this.woop.editor.unit_by_ceil, x * this.woop.editor.ceil_pixel_size() - pixel_grid_x_offset, 20 ) }
            if( 0 !== Math.ceil( ( x + ceil_x_offset ) * this.woop.editor.unit_by_ceil ) ){
                this.context.moveTo( x * this.woop.editor.ceil_pixel_size() - pixel_grid_x_offset, 0 )
                this.context.lineTo( x * this.woop.editor.ceil_pixel_size() - pixel_grid_x_offset, this.canvas.height )
            }else{
                zero_lines.push( [
                    x * this.woop.editor.ceil_pixel_size() - pixel_grid_x_offset,
                    0,
                    x * this.woop.editor.ceil_pixel_size() - pixel_grid_x_offset,
                    this.canvas.height
                ] )
            }
        }
        for( let y = 0; y <= screen_step_y; y++ ){
            if( y > 1 ){ this.context.fillText( ( y * -1 + ceil_y_offset ) * this.woop.editor.unit_by_ceil, 20, y * this.woop.editor.ceil_pixel_size() - pixel_grid_y_offset ) }
            if( 0 !== Math.ceil( (  y * -1 + ceil_y_offset ) * this.woop.editor.unit_by_ceil ) ){
                this.context.moveTo( 0,                  y * this.woop.editor.ceil_pixel_size() - pixel_grid_y_offset )
                this.context.lineTo( this.canvas.width, y * this.woop.editor.ceil_pixel_size() - pixel_grid_y_offset )
            }else{
                zero_lines.push( [
                    0,
                    y * this.woop.editor.ceil_pixel_size() - pixel_grid_y_offset,
                    this.canvas.width,
                    y * this.woop.editor.ceil_pixel_size() - pixel_grid_y_offset
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
    draw_editor_sector_in_field_of_view_2D = ( bsp_tree ) => {
        bsp_tree.render_nodes( this.woop.player, this.draw_editor_sub_sector_2D )
    }
    draw_bsp_node_2D = ( bsp_node ) => {
        this.draw_editor_box_2D(
            bsp_node.right_bound_box.top_left.x,
            bsp_node.right_bound_box.top_left.y,
            bsp_node.right_bound_box.bottom_right.x,
            bsp_node.right_bound_box.bottom_right.y,
            "dark green",
            .5,
            2
        )
        this.draw_editor_box_2D(
            bsp_node.left_bound_box.top_left.x,
            bsp_node.left_bound_box.top_left.y,
            bsp_node.left_bound_box.bottom_right.x,
            bsp_node.left_bound_box.bottom_right.y,
            "dark red",
            .5,
            2
        )
        this.draw_editor_line_2D(
            bsp_node.partition_line.start.x,
            bsp_node.partition_line.start.y,
            bsp_node.partition_line.end.x,
            bsp_node.partition_line.end.y,
            "dark yellow",
            1,
            2
        )
    }
    draw_editor_bound_box_2D = ( bound_box ) => {
        this.draw_editor_box_2D(
            bound_box.top_left.x,
            bound_box.top_left.y,
            bound_box.bottom_right.x,
            bound_box.bottom_right.y,
            "dark green",
            .5,
            2
        )
    }
    draw_editor_sub_sector_2D = ( sub_sector ) => {
        for( let i = 0; i < sub_sector.segments.length; i++ ){
            //seg are not facing player
            let angle_start = WoopMath.point_to_angle( this.woop.player.position, sub_sector.segments[ i ].edge.vertices[ 0 ] )
            let angle_end   = WoopMath.point_to_angle( this.woop.player.position, sub_sector.segments[ i ].edge.vertices[ 1 ] )
            let angle_span  = WoopMath.angle_range( angle_start - angle_end, 0, 360, true, false )
            if( angle_span > 180 ){ continue }

            let x1_angle = angle_start - this.woop.player.horizontal_angle
            let angle_start_span = WoopMath.angle_range( x1_angle + this.woop.renderer.demi_horisontal_fov, 0, 360, true, false )
            if( angle_start_span > angle_span + this.woop.renderer.horisontal_fov ){ continue }

            let x2_angle = angle_end - this.woop.player.horizontal_angle
            let angle_end_span = WoopMath.angle_range( this.woop.renderer.demi_horisontal_fov - x2_angle, 0, 360, true, false )
            if( angle_end_span > angle_span + this.woop.renderer.horisontal_fov ){ continue }

            this.add_color(
                sub_sector.id,
                WoopMath.random_int_range( 100, 255 ),
                WoopMath.random_int_range( 100, 255 ),
                WoopMath.random_int_range( 100, 255 )
            )
            this.draw_editor_line(
                sub_sector.segments[ i ].edge.vertices[ 0 ].x,
                sub_sector.segments[ i ].edge.vertices[ 0 ].y,
                sub_sector.segments[ i ].edge.vertices[ 1 ].x,
                sub_sector.segments[ i ].edge.vertices[ 1 ].y,
                sub_sector.id, 1, 4
            )
        }
    }

    //game function
    draw_game_pixel_2D = ( x, y, color, alpha ) => {
        if( x < 0 || x > this.internal_width - 1 ){ return }
        if( y < 0 || y > this.internal_height - 1 ){ return }
        this.context.fillStyle = this.get_color( color, 1, true )
        this.context.fillRect( x * this.pixel_scale, y * this.pixel_scale, this.pixel_scale, this.pixel_scale )
    }

    draw_game_vertical_line_2D = ( x, start_y, end_y, texture, light ) => {
        if( x < 0 || x > this.internal_width ){ return }
        for( let y = start_y; y <= end_y; y++ ){
            if( y < 0 || y > this.internal_height ){ continue }
            if( this.screen_space.pixel_has_space( x, y ) ){
                let color = texture
                this.draw_game_pixel( x, y, color, 1 )
                this.screen_space.fill_pixel( x, y )
            }
        }
    }

    draw_game_edge_2D = ( segment, angle_start, x_start, x_end, range_x_star, range_x_end ) => {
        let right_edge_side = segment.edge.right
        let left_edge_side  = segment.edge.left
        let right_sector    = right_edge_side.sector
        let left_sector     = ( left_edge_side ) ? left_edge_side.sector : false

        let upper_texture   = right_edge_side.textures.upper
        let middle_texture  = right_edge_side.textures.middle
        let lower_texture   = right_edge_side.textures.low
        let celling_texture = right_sector.celling.texture
        let floor_texture   = right_sector.floor.texture

        let edge_light      = right_edge_side.light
        let floor_light     = right_sector.floor.light
        let celling_light   = right_sector.celling.light

        let relative_celling_height = right_sector.celling.height - this.woop.player.position.z
        let relative_floor_height   = right_sector.floor.height - this.woop.player.position.z
        let relative_upper_height = ( left_sector )
            ? left_sector.celling.height - this.woop.player.position.z : relative_celling_height
        let relative_low_height = ( left_sector )
            ? left_sector.floor.height - this.woop.player.position.z  : relative_floor_height

        if( relative_upper_height > relative_celling_height ){
            relative_upper_height = [ relative_celling_height, relative_celling_height = relative_upper_height ][0]
            upper_texture         = left_edge_side.textures.upper
            //celling_texture       = left_sector.celling.texture
        }
        if( relative_low_height < relative_floor_height ){
            relative_low_height = [ relative_floor_height, relative_floor_height = relative_low_height ][0]
            lower_texture       = left_edge_side.textures.low
            //floor_texture       = left_sector.floor.texture
        }

        let upper_edge_is_draw  = ( upper_texture !== false )
        let middle_edge_is_draw = ( middle_texture !== false )
        let lower_edge_is_draw  = ( lower_texture !== false )
        let celling_is_draw     = ( celling_texture !== false )
        let floor_is_draw       = ( floor_texture !== false )

        let edge_normal  = segment.edge.angle + 90
        let offset_angle = edge_normal - angle_start
        let hypotenuse   = WoopMath.distance( this.woop.player.position, segment.edge.vertices[ 0 ] )
        let distance     = hypotenuse * Math.cos( WoopMath.degrees_to_radians( offset_angle ) )

        let scale_start  = WoopMath.scale( x_start, edge_normal, distance, this.screen_distance, this.woop.player.horizontal_angle )
        let scale_end    = WoopMath.scale( x_end, edge_normal, distance, this.screen_distance, this.woop.player.horizontal_angle )
        let scale_step   = ( scale_end - scale_start ) / ( x_end - x_start )

        let edge_celling_y    = this.demi_internal_height - relative_celling_height * scale_start
        let edge_celling_step = -scale_step * relative_celling_height
        let edge_upper_y      = this.demi_internal_height - relative_upper_height * scale_start
        let edge_upper_step   = -scale_step * relative_upper_height
        let edge_low_y        = this.demi_internal_height - relative_low_height * scale_start
        let edge_low_step     = -scale_step * relative_low_height
        let edge_floor_y      = this.demi_internal_height - relative_floor_height * scale_start
        let edge_floor_step   = -scale_step * relative_floor_height

        for( let x = x_start; x <= x_end; x++ ){
            if( x < range_x_star || x > range_x_end ){ continue }
            let celling_y = edge_celling_y + edge_celling_step * ( x - x_start )
            let upper_y   = edge_upper_y + edge_upper_step * ( x - x_start )
            let low_y     = edge_low_y + edge_low_step * ( x - x_start )
            let floor_y   = edge_floor_y + edge_floor_step * ( x - x_start )

            if( celling_is_draw ){
                this.draw_game_vertical_line( x, 0, Math.round( celling_y ), celling_texture, celling_light )
                this.screen_space.fill_vertical_line( x, 0, Math.round( celling_y ) )
            }
            if( upper_edge_is_draw ){
                this.draw_game_vertical_line( x, Math.round( celling_y ), Math.round( upper_y ), upper_texture )
                this.screen_space.fill_vertical_line( x, Math.round( celling_y ), Math.round( upper_y ) )
            }
            if( middle_edge_is_draw ){
                let y1 = ( upper_edge_is_draw ) ? upper_y : celling_y
                let y2 = ( lower_edge_is_draw && floor_y > low_y  ) ? low_y : floor_y
                this.draw_game_vertical_line( x, Math.round( y1 ), Math.round( y2 ), middle_texture, edge_light )
                this.screen_space.fill_vertical_line( x, Math.round( y1 ), Math.round( y2 ) )
            }
            if( lower_edge_is_draw ){
                this.draw_game_vertical_line( x, Math.round( low_y ), Math.round( floor_y ), lower_texture, edge_light )
                this.screen_space.fill_vertical_line( x, Math.round( low_y ), Math.round( floor_y ) )
            }
            if( floor_is_draw ){
                this.draw_game_vertical_line( x, Math.round( floor_y ), this.internal_height -1, floor_texture, floor_light )
                //this.screen_space.fill_vertical_line( x, Math.round( floor_y ), this.internal_height -1 )
            }
        }

    }

    draw_game_sector_in_field_of_view_2D = ( bsp_tree ) => {
        this.screen_space.init()
        bsp_tree.render_nodes( this.woop.player, this.draw_game_sub_sector_2D, this.screen_space.is_full )
        //console.log( this.screen_space )
    }
    draw_game_sub_sector_2D = ( sub_sector ) => {
        for( let i = 0; i < sub_sector.segments.length && this.screen_space.has_space(); i++ ){
            //segment are not facing player
            let angle_start = WoopMath.point_to_angle( this.woop.player.position, sub_sector.segments[ i ].edge.vertices[ 0 ] )
            let angle_end   = WoopMath.point_to_angle( this.woop.player.position, sub_sector.segments[ i ].edge.vertices[ 1 ] )
            let angle_span  = WoopMath.angle_range( angle_start - angle_end, 0, 360, true, false )
            if( angle_span > 180 ){ continue }

            //segment are not in field of view
            let x1_angle = angle_start - this.woop.player.horizontal_angle
            let angle_start_span = WoopMath.angle_range( x1_angle + this.woop.renderer.demi_horisontal_fov, 0, 360, true, false )
            if( angle_start_span >= angle_span + this.woop.renderer.horisontal_fov ){ continue }

            let x2_angle = angle_end - this.woop.player.horizontal_angle
            let angle_end_span = WoopMath.angle_range( this.woop.renderer.demi_horisontal_fov - x2_angle, 0, 360, true, false )
            if( angle_end_span >= angle_span + this.woop.renderer.horisontal_fov ){ continue }

            let x1 = WoopMath.value_range(
                WoopMath.angle_to_screen_x( x1_angle, this.screen_distance, this.demi_internal_width ),
                0, this.internal_width -1
            )
            let x2 = WoopMath.value_range(
                WoopMath.angle_to_screen_x( x2_angle, this.screen_distance, this.demi_internal_width ),
                0, this.internal_width -1
            )

            if( x1 > x2 ){
                //TODO console.log( sub_sector.segments[ i ] )
            }else if( this.screen_space.horizontal_line_has_space( x1, x2 ) ){
                for( let x = x1; x <= x2; x++ ){
                    if( this.screen_space.vertical_line_has_space( x ) ){
                        let emptiness_end_at = this.screen_space.get_empty_horizontal_range( x )
                        this.draw_game_edge( sub_sector.segments[ i ], angle_start, x1, x2, x, emptiness_end_at )
                        x = emptiness_end_at
                    }
                }
            }

        }
    }

}