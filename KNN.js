var W = window.innerWidth, H = window.innerHeight;
var pixel_size = 30;
var update_time = 1;
var pixel_fade_in = 1000;
var p_row_size = W/pixel_size;
var p_col_size = H/pixel_size;

class Pixel {
	constructor(size, x, y, ctx){
		this.size = size;
		this.x = x;
		this.y = y;
		this.pixel_x = x*size;
		this.pixel_y = y*size;
		this.nearest = [];
		this.hue = 180;
		this.saturation = 100;
		this.lightness = 100;
		this.ctx = ctx;
		this.is_on = false;

		// color animation vars
		this.hue_target = 180;
		this.hue_time_remaining = 0;

		this.lightness_target = 100;
		this.lightness_time_remaining = 0;
	}
	get colorHSL() {
		return 'hsl(' + this.hue + ',' + this.saturation + '%,' + this.lightness +'%)';
	}
	draw() {
		this.ctx.fillStyle = this.colorHSL;
		this.ctx.fillRect(this.pixel_x, this.pixel_y, this.size, this.size);
	}

	change_color(change_to){
		this.hue_target = change_to;
		this.hue_time_remaining = pixel_fade_in;
	}

	change_lightness(change_to){
		this.lightness_target = change_to;
		this.lightness_time_remaining = pixel_fade_in;
	}

	hue_animate(time_delta){
		if(this.hue_time_remaining <= 0) return;

		// Find proportion of time that has passed
		var animation_proportion = 0;
		if(time_delta < this.hue_time_remaining){
			animation_proportion = time_delta/this.hue_time_remaining;
			this.hue_time_remaining -= time_delta;
		}else{
			animation_proportion = 1;
			this.hue_time_remaining = 0;
		}

		// amount of hue change needed total
		var hue_delta = this.hue_target - this.hue;

		// To find the actual hue delta, we need to check if going around the color space is shorter
		if(this.hue_target < this.hue){
			var flipped_hue_target = this.hue_target + 360;
			hue_delta = Math.abs(this.hue_target - this.hue) < Math.abs(flipped_hue_target - this.hue) ? this.hue_target - this.hue : flipped_hue_target - this.hue;
		}else{
			var flipped_hue = this.hue + 360;
			hue_delta = Math.abs(this.hue_target - this.hue) < Math.abs(this.hue_target - flipped_hue) ? this.hue_target - this.hue : this.hue_target - flipped_hue;
		}

		// amount of hue to change this update
		var update_hue_delta = hue_delta*animation_proportion;

		this.hue += update_hue_delta
	}

	lightness_animate(time_delta){
		if(this.lightness_time_remaining <= 0) return;

		// Find proportion of time that has passed
		var animation_proportion = 0;
		if(time_delta < this.lightness_time_remaining){
			animation_proportion = time_delta/this.lightness_time_remaining;
			this.lightness_time_remaining -= time_delta;
		}else{
			animation_proportion = 1;
			this.lightness_time_remaining = 0;
		}

		// amount of hue change needed total
		var lightness_delta = this.lightness_target - this.lightness;

		// amount of hue to change this update
		var update_lightness_delta = lightness_delta*animation_proportion;

		this.lightness += update_lightness_delta
	}

	turn_on(){
		this.is_on = true;
		this.change_lightness(50);
	}

	turn_off(){
		this.is_on = false;
		this.change_lightness(100);
	}
}
// Make pixel grid
var pixels = [];
var pixel_draw_stack = [];
var start_time = new Date();
var last_timestamp;
var last_update_time = start_time;
var canvas;
var ctx;

function turn_on_random(chance_per_frame){
	var turn_on = Math.random();
	if(turn_on <= chance_per_frame){
		var random_pixel_index = Math.round(Math.random() * (p_row_size*p_col_size));
		var random_color = Math.floor(Math.random()*360)

		pixels[random_pixel_index].turn_on();
		pixels[random_pixel_index].change_color(random_color);
	}
}
function update_screen(timestamp){
	if(!last_timestamp) last_timestamp = timestamp;
	var timestamp_diff = timestamp-last_timestamp;
	last_timestamp = timestamp;

	var current_time = new Date();
	var time_since_update = current_time - last_update_time;
	var new_update = false;

	// We want to do a major update, I.E turn a new pixel on or off, every x seconds (set by update_time)
	// between these update will be minor animations like pixel colors changing.
	if(time_since_update > update_time){
		new_update = true;
		last_update_time = current_time;
	}

	// Do major update if time
	if(new_update){
		// logic to turn on or off pixels
		turn_on_random(1);
	}


	ctx.clearRect(0, 0, W, H);

	// Draw pixels
	for(var p = 0; p < pixels.length; p++){
		pixels[p].hue_animate(timestamp_diff);
		pixels[p].lightness_animate(timestamp_diff);
		pixels[p].draw();
	}

	window.requestAnimationFrame(update_screen);
}

window.onload = function(){

	// Setup Canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	canvas.width = W;
	canvas.height = H;
	
	//Painting the canvas black
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);


	// Canvas Click event listener
	canvas.addEventListener("mousedown",function(event){

		var mouseX = event.pageX;
		var mouseY = event.pageY;

		if(event.button ===0){
			var pixel_x = Math.floor(mouseX/pixel_size);
			var pixel_y = Math.floor(mouseY/pixel_size);

			var pixel_index = (pixel_y * Math.ceil(p_row_size)) + pixel_x;

			var random_color = Math.floor(Math.random()*360)

			pixels[pixel_index].turn_on();
			pixels[pixel_index].change_color(random_color);
		}
		if(event.button === 1){
			alert("middle mouse button")
		} 
		if(event.button === 2){
			update_screen();
		} 
		

	},false);
	
	for(var y = 0; y < p_col_size; y++){
		for(var x = 0; x < p_row_size; x++){
			pixels.push(new Pixel(pixel_size, x, y, ctx))
		}
	}

	//window.requestAnimationFrame(update_screen);
}