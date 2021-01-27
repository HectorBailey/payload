// Globals
var dist_per_pixel = null;
var payload_pos = PAYLOAD_START_POS;
var waypoint_positions = [];
var team_name = "US"; //"US" or "RU" 

// Dynamic canvas
var dynamic_payload_canvas = document.getElementById("dynamic_payload_canvas");
var dynamic_ctx = dynamic_payload_canvas.getContext("2d");

// Static canvas
var static_payload_canvas = document.getElementById("static_payload_canvas");
var static_ctx = static_payload_canvas.getContext("2d");

// Sums all values in array
function sum_array(in_array){
    return in_array.reduce((a, b) => a + b, 0)
}

// Clears down canvas
function clear_canvas(ctx) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function draw_payload(position, ctx, payload_blocked, attckers_pushing){
    var img = document.getElementById("payload_neutral");

    if(team_name == "US"){
        if(payload_blocked){
            img = document.getElementById("payload_red");
        }

        if(attckers_pushing > 0 && !payload_blocked){
            img = document.getElementById("payload_blue");
        }
    }

    if(team_name == "RU"){
        if(attckers_pushing > 0 && !payload_blocked){
            img = document.getElementById("payload_red");
        }
    }

    var img_height = img.clientHeight;
    var img_width = img.clientWidth;

    ctx.drawImage(img, (position[0] - (img_width/2)),(position[1] - (img_height/2)));
}

// Gets the correct waypoint img and color for the current state/ team
function get_waypoint_info(waypoint_index, waypoint_captured){
    var waypoint_color = "Blue";

    // IF waypoint caputred
    if (waypoint_captured){
        if (team_name == "US"){
            waypoint_color = "Blue"
        } else {
            waypoint_color = "Red"
        }
    } else { // Waypoint not yet captured
        if (team_name == "US"){
            waypoint_color = "Red"
        } else {
            waypoint_color = "Blue"
        }
    }
    return {
        img: document.getElementById("CP_" + waypoint_index.toString() + "_" + waypoint_color), 
        color: waypoint_color
    }
}

// Draws waypoints and updates them after a payload has gone passed
function draw_waypoints(position, ctx){
    // Draw waypoints
    for(var i=0;i<waypoint_positions.length;i++){
        var waypoint_captured = false;
        
        // If payload has passed waypoint, it's been captured
        if (position[0] > waypoint_positions[i][0]){
            waypoint_captured = true;
        }

        // Get waypoint info based on index and weather the waypoint is caputured
        waypoint_info = get_waypoint_info(i+1, waypoint_captured)

        // calc postion on canvas
        var waypoint_img_height = waypoint_info.img.clientHeight;
        var waypoint_img_width = waypoint_info.img.clientWidth;
        var current_waypoint_position = [(waypoint_positions[i][0] - (waypoint_img_width/2)),(waypoint_positions[i][1] - (waypoint_img_height/2))]
        
        // Get arrow and arrow y position
        var up_arrow_img = document.getElementById("Arrow_Up_" + waypoint_info.color);
        var up_arrow_img_height = up_arrow_img.clientHeight;
        var up_arrow_img_width = up_arrow_img.clientWidth;
        var up_arrow_position = [(waypoint_positions[i][0] - (up_arrow_img_width/2)), current_waypoint_position[1] - (up_arrow_img_height)]

        // Draw waypoint and arrow
        ctx.drawImage(up_arrow_img, up_arrow_position[0],up_arrow_position[1]);
        ctx.drawImage(waypoint_info.img, current_waypoint_position[0],current_waypoint_position[1]);
    }
}

// Draws the psuhing status using blue and red arrows above the payload. More pushers more arrows!
function draw_pushing_status(ctx, payload_pos, arrow_img, number_of_pushers){
    // TODO: Add code to allow multiple arrows bassed on number of pushers
    arrow_width = arrow_img.clientWidth
    arrow_height = arrow_img.clientHeight
    ctx.drawImage(arrow_img, (payload_pos[0] - ((arrow_width/2) - INDICATOR_ARROW_X_OFFSET)), (payload_pos[1] - INDICATOR_ARROW_Y_OFFSET));
}


// Draws the current direction payload is moving with arrows
function update_pushing_status(payload_pos, payload_blocked, payload_moving_backwards, number_of_pushers, ctx){
    var status_text = "";
    if (!payload_blocked && (number_of_pushers > 0)) {
        if(team_name == "US"){
            arrow_img = document.getElementById("Arrow_Right_Blue");
        } else {
            arrow_img = document.getElementById("Arrow_Right_Red");
        }
        draw_pushing_status(ctx, payload_pos, arrow_img, number_of_pushers)
    } else if(payload_moving_backwards){
        if(team_name == "US"){
            arrow_img = document.getElementById("Arrow_Left_Red");
        } else {
            arrow_img = document.getElementById("Arrow_Left_Blue");
        }
        draw_pushing_status(ctx, payload_pos, arrow_img, 1)
    }
}

function update_track(payload_pos, ctx){
    ctx.moveTo(TRACK_START_POS, TRACK_Y_POS);
    ctx.lineTo(payload_pos[0], TRACK_Y_POS);
    if(team_name == "US"){
        ctx.strokeStyle = ATTACKERS_PROGRESS_COLOR;
        ctx.shadowColor = ATTACKERS_PROGRESS_GLOW;
    } else {
        ctx.strokeStyle = DEFENDERS_PROGRESS_COLOR;
        ctx.shadowColor = DEFENDERS_PROGRESS_GLOW; 
    }
    ctx.lineWidth = TRACK_THICKNESS;
    ctx.lineCap = 'round';
    ctx.shadowBlur = TRACK_GLOW;
    ctx.stroke();

    // Reset shadowcolor
    ctx.shadowColor = "transparent";
}

// Get waypoint positions on payload ui track
function get_waypoint_positions(cp_numbers, waypoint_dists, dist_per_pixel){
    waypoint_positions = [];
    for(var i=0; i<waypoint_dists.length;i++){
        // Lua is 1 indexed and js is not... Grrr
        if (cp_numbers.includes((i+1))){

            // Summing all distances up until the waypoint
            var dist_start_to_waypoint = sum_array(waypoint_dists.slice(0, (i+1)))

            waypoint_positions.push([TRACK_START_POS + (dist_start_to_waypoint/dist_per_pixel), WAYPOINT_Y_OFFSET]);
        }
    }
}