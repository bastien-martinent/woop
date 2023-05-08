import Int2DVertex from "./type/Int2DVertex.js"
import Int3DVertex from "./type/Int3DVertex.js"
import Player from "./Player.js"

export default class Level{
    constructor(){
        this.name     = 'void'
        this.vertices = []
        this.edges    = []
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
