import Int2DVertex from "./type/Int2DVertex.js"

export class BSPTree{
    constructor( mood, nodes ) {
        this.mood  = mood
        this.root  = nodes[ nodes.length-1 ]
        this.nodes = nodes
    }
    render_node( player, draw_callback, node = this.root ){
        if( node instanceof SubSector ){
            draw_callback( node )
            return
        }
        if( this.is_right( player, node ) ){
            this.mood.renderer.draw_editor_bound_box( node.right_bound_box )
            this.render_node( player, draw_callback, node.right )
            if( this.check_bound_box( player, node.left_bound_box ) ){
                this.mood.renderer.draw_editor_bound_box( node.left_bound_box )
                this.render_node( player, draw_callback, node.left )
            }
        }else{
            this.mood.renderer.draw_editor_bound_box( node.left_bound_box )
            this.render_node( player, draw_callback, node.left )
            if( this.check_bound_box( player, node.right_bound_box ) ){
                this.mood.renderer.draw_editor_bound_box( node.right_bound_box )
                this.render_node( player, draw_callback, node.right )
            }
        }
    }
    //?? do not work ???
    is_right( player, node ){
        let delta_x = player.position.x - node.partition_line.start.x
        let delta_y = player.position.y - node.partition_line.start.y
        return ( ( delta_x * node.partition_line.y_direction ) - ( delta_y * node.partition_line.x_direction ) >= 0 )
    }
    check_bound_box( player, bound_box ){
        let left         = bound_box.top_left.x
        let right        = bound_box.bottom_right.x
        let top          = bound_box.top_left.y
        let bottom       = bound_box.bottom_right.y
        let box_vertex_a = new Int2DVertex( left, bottom )
        let box_vertex_b = new Int2DVertex( left, top)
        let box_vertex_c = new Int2DVertex( right, top )
        let box_vertex_d = new Int2DVertex( right, bottom )
        let box_sides    = []

        if( player.position.x < left ){
            if( player.position.y > top ){
                box_sides = [ [ box_vertex_b, box_vertex_a ], [ box_vertex_b, box_vertex_c ] ]
            }else if( player.position.y < bottom ){
                box_sides = [ [ box_vertex_b, box_vertex_a ], [ box_vertex_a, box_vertex_d ] ]
            }else{
                box_sides = [ [ box_vertex_b, box_vertex_a ] ]
            }
        }else if( player.position.x > right ){
            if( player.position.y > top ){
                box_sides = [ [ box_vertex_b, box_vertex_c ], [ box_vertex_d, box_vertex_c ] ]
            }else if( player.position.y < bottom ){
                box_sides = [ [ box_vertex_a, box_vertex_d ], [ box_vertex_d, box_vertex_c ] ]
            }else{
                box_sides = [ [ box_vertex_d, box_vertex_c ] ]
            }
        }else{
            if( player.position.y > top ){
                box_sides = [ [ box_vertex_b, box_vertex_c ] ]
            }else if(player.position.y < bottom  ){
                box_sides = [ [ box_vertex_a, box_vertex_d ] ]
            }else{
                return true
            }
        }

        for( let i = 0; i < box_sides.length; i++ ){
            let angle_start             = this.mood.math_utility.angle_range( this.mood.math_utility.point_to_angle( player.position, box_sides[ i ][ 0 ] ),0, 360, true, false )
            let angle_end               = this.mood.math_utility.angle_range( this.mood.math_utility.point_to_angle( player.position, box_sides[ i ][ 1 ] ), 0, 360, true, false )
            let player_horizontal_start = this.mood.math_utility.angle_range( player.look_horizontal + this.mood.renderer.horisontal_fov / 2, 0, 360, true, false )
            let player_horizontal_end   = this.mood.math_utility.angle_range( player.look_horizontal - this.mood.renderer.horisontal_fov / 2, 0, 360, true, false )
            if(
                ( player_horizontal_start > angle_start && player_horizontal_end < angle_start )
                || ( player_horizontal_start > angle_end && player_horizontal_end < angle_end )
            ){
                return true
            }
        }
        return false
    }
}

export class BSPNode{
    constructor( id, right_node, left_node, right_bound_box, left_bound_box, partition_line ) {
        this.id               = id
        this.right            = right_node
        this.left             = left_node
        this.right_bound_box  = right_bound_box
        this.left_bound_box   = left_bound_box
        this.partition_line   = partition_line
    }
}

export class BoundBox{
    constructor( top_left, bottom_right ){
        this.top_left     = top_left
        this.bottom_right = bottom_right
    }
}
export class PartitionLine{
    constructor( start, end, x_direction = null, y_direction= null ){
        this.start = start
        this.end   = end
        this.x_direction = ( x_direction !== null ) ? x_direction : end.x - start.x
        this.y_direction = ( y_direction !== null ) ? y_direction : end.y - start.y
    }
}
export class SubSector{
    constructor( id, segments ){
        this.id       = id
        this.segments = segments
    }
}
export class Segment{
    constructor( vertex_start, vertex_end, angle, direction, offset, edge ){
        this.vertices = [ vertex_start, vertex_end ]
        this.angle = angle
        this.direction = direction
        this.offset = offset
        this.edge = edge
    }
}