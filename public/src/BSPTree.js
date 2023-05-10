import Int2DVertex from "./type/Int2DVertex.js"
import MoodMath from "./MoodMath.js"

export class BSPTree{
    constructor( mood, nodes ) {
        this.mood  = mood
        this.nodes = nodes
        this.root  = nodes[ nodes.length-1 ]
    }
    render_nodes( player, draw_callback, interrupt_callback = () => { return false }, node = this.root, ){
        if( interrupt_callback() ){ return }
        if( node instanceof SubSector ){
            //leaf are SubSector object
            draw_callback( node )
            return
        }
        if( this.is_right( player, node ) ){
            this.render_nodes( player, draw_callback, interrupt_callback, node.right )
            if( this.check_bound_box( player, node.left_bound_box ) ){
                this.render_nodes( player, draw_callback, interrupt_callback, node.left )
            }
        }else{
            this.render_nodes( player, draw_callback, interrupt_callback, node.left )
            if( this.check_bound_box( player, node.right_bound_box ) ){
                this.render_nodes( player, draw_callback, interrupt_callback, node.right )
            }
        }
    }
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
                box_sides = [ [ box_vertex_b, box_vertex_a ], [ box_vertex_c, box_vertex_b ] ]
            }else if( player.position.y < bottom ){
                box_sides = [ [ box_vertex_b, box_vertex_a ], [ box_vertex_a, box_vertex_d ] ]
            }else{
                box_sides = [ [ box_vertex_b, box_vertex_a ] ]
            }
        }else if( player.position.x > right ){
            if( player.position.y > top ){
                box_sides = [ [ box_vertex_c, box_vertex_b ], [ box_vertex_d, box_vertex_c ] ]
            }else if( player.position.y < bottom ){
                box_sides = [ [ box_vertex_a, box_vertex_d ], [ box_vertex_d, box_vertex_c ] ]
            }else{
                box_sides = [ [ box_vertex_d, box_vertex_c ] ]
            }
        }else{
            if( player.position.y > top ){
                box_sides = [ [ box_vertex_c, box_vertex_b ] ]
            }else if(player.position.y < bottom  ){
                box_sides = [ [ box_vertex_a, box_vertex_d ] ]
            }else{
                return true
            }
        }
        for( let i = 0; i < box_sides.length; i++ ){
            let angle_start  = MoodMath.angle_range( MoodMath.point_to_angle( player.position, box_sides[ i ][ 0 ] ),0, 360, true, false )
            let angle_end    = MoodMath.angle_range( MoodMath.point_to_angle( player.position, box_sides[ i ][ 1 ] ), 0, 360, true, false )
            let angle_span   = MoodMath.angle_range( angle_start - angle_end, 0, 360, true, false )
            let angle_span_1 = MoodMath.angle_range( angle_start - player.horizontal_angle + this.mood.renderer.demi_horisontal_fov , 0, 360, true, false )
            if( angle_span_1 < this.mood.renderer.horisontal_fov + angle_span ){ return true }
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
    constructor( vertex_start, vertex_end, angle, offset, edge ){
        this.vertices = [ vertex_start, vertex_end ]
        this.angle    = angle
        this.offset   = offset
        this.edge     = edge
    }
}
export class Edge {
    constructor( vertex_start, vertex_end, direction, angle, right, left, attributes = {} ){
        this.vertices   = [ vertex_start, vertex_end ]
        this.direction  = direction
        this.angle      = angle
        this.right      = right
        this.left       = left
        this.attributes = attributes
    }
    set_direction( direction ){
        if( this.direction !== direction && [ 0,1 ].includes( direction ) ){
            this.direction = direction
            let swap       = this.right
            this.right     = this.left
            this.left      = swap
        }
    }
    set_angle( angle ){
        this.angle = MoodMath.angle_range( angle, 0, 360, true, false )
    }
}
export class EdgeSide {
    constructor( offset, sector, light, upper_textures, middle_textures, lower_textures, attributes = {} ){
        this.offset     = offset
        this.sector     = sector
        this.light      = light
        this.textures   = {
            up     : upper_textures,
            middle : middle_textures,
            low    : lower_textures,
        }
        this.attributes = attributes
    }
}
export class Sector {
    constructor( ceiling_height, floor_height, ceiling_textures, floor_texture, ceiling_light, floor_light, ){
        this.celling = {
            height  : ceiling_height,
            texture : ceiling_textures,
            light   : ceiling_light
        }
        this.floor = {
            height  : floor_height,
            texture : floor_texture,
            light   : floor_light
        }
    }
}