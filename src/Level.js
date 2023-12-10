import Int2DVertex from "./type/Int2DVertex.js"
import Int3DVertex from "./type/Int3DVertex.js"
import Player from "./Player.js"

export default class Level{
    constructor( woop ){
        this.woop     = woop
        this.name     = 'void'
        this.vertices = []
        this.segments = []
        this.size     = new Int2DVertex( 1,1 )
        this.bsp_tree = null
        this.boundary = [
            new Int2DVertex( 0,0 ),
            new Int2DVertex( 1,1 ),
        ]
        this.player_start = {
            position         : new Int3DVertex( 1,1, 45 ),
            horizontal_angle : 0,
            vertical_angle   : 0
        }
    }
    load_from_wad( wad_loader, map_name ){
        let map_data = wad_loader.get_map_data( map_name )
        this.name         = map_name
        this.size         = map_data.get_size()
        this.boundary     = map_data.get_boundary()
        this.bsp_tree     = map_data.get_bsp_tree()
        this.player_start = map_data.get_player_start()
        this.vertices     = map_data.get_vertices()
        this.segments     = map_data.get_segments()
    }
    spawn_player( player_height ){
        let player = new Player(
            this.player_start.position,
            this.player_start.horizontal_angle,
            this.player_start.vertical_angle,
            player_height
        )
        let result = this.bsp_tree.get_subsectors_to_render( player )
        player.position.set_z( player_height + result.player_sector.floor.height )
        return player
    }
}
