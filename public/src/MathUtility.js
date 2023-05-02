export default class MathUtility {
    constructor() {
        this.lookup_table = { cos: [], sin: [], }
        for( let x = 0; x < 360; x++ ){
            this.lookup_table.cos[ x ] = Math.cos( x * Math.PI / 180 )
            this.lookup_table.sin[ x ] = Math.sin( x * Math.PI / 180 )
        }
        this.pi2 = 2 * Math.PI
    }
    get_distance( point_1, point_2 ){
        return Math.round( Math.sqrt( Math.pow( point_2.x-point_1.x, 2 ) + Math.pow( ( point_2.y-point_1.y ), 2 ) ) )
    }
    clip_behind_player( vector1, vector2 ){
        let distance_a = vector1.y
        let distance_b = vector2.y
        let distance  = distance_a - distance_b
        if( distance === 0 ){ distance = 1 }
        let s = distance_a / ( distance_a - distance_b )
        vector1.x = vector1.x + s * ( vector2.x - vector1.x )
        vector1.y = vector1.y + s * ( vector2.y - vector1.y )
        if( vector1.y === 0 ){ vector1.y = 1 }
        vector1.z = vector1.z + s * ( vector1.y - vector1.z )
    }
    angle_range( angle, min_angle = 0 , max_angle = 360, loop = true ){
        if( loop ){
            if( angle > max_angle ){ angle -= max_angle }
            if( angle < min_angle ){ angle += max_angle }
        }else{
            if( angle > max_angle ){ angle = max_angle }
            if( angle < min_angle ){ angle = min_angle }
        }
        return angle
    }
    value_range( value, min, max, loop = false ){
        if( loop ){
            if( value > max ){ return min + ( value % max ) }
            if( value > min ){ return max - ( value % max ) }
        }
        return Math.min( Math.max( value, min ), max )
    }
}
