window.init_UI = function(data)
{
    // TODO: assin team_name global
    team_name = "US" //data.team_name???

    // Add up all distances 
    var total_dist = sum_array(data.waypoint_distances)

    // Length of payload track on UI
    dist_per_pixel = total_dist/TRACK_LENGTH 

    // Get waypoint positions on UI
    get_waypoint_positions(data.cp_waypoint_numbers, data.waypoint_distances, dist_per_pixel)

    // Set up track
    static_ctx.moveTo(TRACK_START_POS, TRACK_Y_POS);
    static_ctx.lineTo(TRACK_END_POS, TRACK_Y_POS);
    static_ctx.lineWidth = TRACK_THICKNESS;
    static_ctx.stroke();

    clear_canvas(dynamic_ctx);
    // Inital pos of payload
    draw_payload(PAYLOAD_START_POS, dynamic_ctx)
};

window.update_UI = function(data)
{                
    clear_canvas(dynamic_ctx)

    if(dist_per_pixel != null){
        payload_pos[0] = (data.dist_moved/dist_per_pixel) + TRACK_START_POS; //Offset
    }

    draw_waypoints(payload_pos, dynamic_ctx)

    draw_pushing_status(payload_pos, data.payload_blocked, data.attckers_pushing, dynamic_ctx)

    draw_payload(payload_pos, dynamic_ctx, data.payload_blocked, data.attckers_pushing)
};