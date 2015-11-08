// base slicer options
var slBaseOpts = {'slic3r':[
{section:'Printer Options', options: [
{opt:'--nozzle-diameter',name:'Diameter of nozzle in mm (default: 0.5)',value:'.5'},
{opt:'--print-center',name:'Coordinates in mm of the point to center the print around (default: 100,100)',value:'100,100'},
{opt:'--z-offset',name:'Additional height in mm to add to vertical coordinates, positive is above the bed surface (+/-, default: 0)',value:'0'},
{opt:'--gcode-flavor',name:'The type of G-code to generate (reprap/teacup/makerware/sailfish/mach3/no-extrusion, default: reprap)',value:['reprap','teacup','makerware','sailfish','mach3','no-extrusion']},
{opt:'--use-relative-e-distances',name:'Enable this to get relative E values (default: no)',value:['no','yes']},
{opt:'--use-firmware-retraction',name:'Enable firmware-controlled retraction using G10/G11 (default: no)',value:['no','yes']},
{opt:'--gcode-arcs',name:'Use G2/G3 commands for native arcs (experimental, not supported by all firmwares)',value:['no','yes']},
{opt:'--g0',name:'Use G0 commands for retraction (experimental, not supported by all firmwares)',value:['no','yes']},
{opt:'--gcode-comments',name:'Make G-code verbose by adding comments (default: no)',value:['no','yes']},
{opt:'--vibration-limit',name:'Limit the frequency of moves on X and Y axes (Hz, set zero to disable; default: 0)',value:'0'},
]},
{section:'Filament Options', options: [
{opt:'--filament-diameter',name:'Diameter in mm of your raw filament (default: 3)',value:'3'},
{opt:'--extrusion-multiplier',name:'Change this to alter the amount of plastic extruded. There should be very little need to change this value, which is only useful to compensate for filament packing (default: 1)',value:'1'},
{opt:'--temperature',name:'Extrusion temperature in degree Celsius, set 0 to disable (default: 200)',value:'200'},
{opt:'--first-layer-temperature',name:'Extrusion temperature for the first layer, in degree Celsius, set 0 to disable (default: same as temperature)',value:'200'},
{opt:'--bed-temperature',name:'Heated bed temperature in degree Celsius, set 0 to disable (default: 0)',value:'0'},
{opt:'--first-layer-bed-temperature',name:'Heated bed temperature for the first layer, in degree Celsius, set 0 to disable (default: same as bed-temperature)',value:'0'},
]},
{section:'Speed Options', options: [
{opt:'--travel-speed',name:'Speed of non-print moves in mm/s (default: 130)',value:'130'},
{opt:'--perimeter-speed',name:'Speed of print moves for perimeters in mm/s (default: 30)',value:'30'},
{opt:'--small-perimeter-speed',name:'Speed of print moves for small perimeters in mm/s or % over perimeter speed (default: 30)',value:'30'},
{opt:'--external-perimeter-speed',name:'Speed of print moves for the external perimeter in mm/s or % over perimeter speed (default: 70%)',value:'70%'},
{opt:'--infill-speed',name:'Speed of print moves in mm/s (default: 60)',value:'60'},
{opt:'--solid-infill-speed',name:'Speed of print moves for solid surfaces in mm/s or % over infill speed (default: 60)',value:'60'},
{opt:'--top-solid-infill-speed',name:'Speed of print moves for top surfaces in mm/s or % over solid infill speed (default: 50)',value:'50'},
{opt:'--support-material-speed',name:'Speed of support material print moves in mm/s (default: 60)',value:'60'},
{opt:'--support-material-interface-speed',name:'Speed of support material interface print moves in mm/s or % over support material speed (default: 100%)',value:'100%'},
{opt:'--bridge-speed',name:'Speed of bridge print moves in mm/s (default: 60)',value:'60'},
{opt:'--gap-fill-speed',name:'Speed of gap fill print moves in mm/s (default: 20)',value:'20'},
{opt:'--first-layer-speed',name:'Speed of print moves for bottom layer, expressed either as an absolute value or as a percentage over normal speeds (default: 30%)',value:'30%'},
]},
{section:'Acceleration Options', options: [
{opt:'--perimeter-acceleration',name:'Overrides firmware default acceleration for perimeters. (mm/s^2, set zero to disable; default: 0)',value:'0'},
{opt:'--infill-acceleration',name:'Overrides firmware default acceleration for infill. (mm/s^2, set zero to disable; default: 0)',value:'0'},
{opt:'--bridge-acceleration',name:'Overrides firmware default acceleration for bridges. (mm/s^2, set zero to disable; default: 0)',value:'0'},
{opt:'--first-layer-acceleration',name:'Overrides firmware default acceleration for first layer. (mm/s^2, set zero to disable; default: 0)',value:'0'},
{opt:'--default-acceleration',name:'Acceleration will be reset to this value after the specific settings above have been applied. (mm/s^2, set zero to disable; default: 0)',value:'0'},
]},
{section:'Accuracy Options', options: [
{opt:'--layer-height',name:'Layer height in mm (default: 0.3)',value:'.3'},
{opt:'--first-layer-height',name:'Layer height for first layer (mm or %, default: 0.35)',value:'.35'},
{opt:'--infill-every-layers',name:'Infill every N layers (default: 1)',value:'1'},
{opt:'--solid-infill-every-layers',name:'Force a solid layer every N layers (default: 0)',value:'0'},
]},
{section:'Print Options', options: [
{opt:'--perimeters',name:'Number of perimeters/horizontal skins (range: 0+, default: 3)',value:'3'},
{opt:'--top-solid-layers',name:'Number of solid layers to do for top surfaces (range: 0+, default: 3)',value:'3'},
{opt:'--bottom-solid-layers',name:'Number of solid layers to do for bottom surfaces (range: 0+, default: 3)',value:'3'},
{opt:'--fill-density',name:'Infill density (range: 0%-100%, default: 40%)',value:'40%'},
{opt:'--fill-angle',name:'Infill angle in degrees (range: 0-90, default: 45)',value:'45'},
{opt:'--fill-pattern',name:'Pattern to use to fill non-solid layers (default: honeycomb)',value:['3dhoneycomb','honeycomb','concentric','line','hilbertcurve','octagramspiral','flowsnake','rectilinear','archimedeanchords']},
{opt:'--solid-fill-pattern',name:'Pattern to use to fill solid layers (default: rectilinear)',value:['rectilinear','3dhoneycomb','honeycomb','concentric','line','hilbertcurve','octagramspiral','flowsnake','archimedeanchords']},
//{opt:'--start-gcode',name:'Load initial G-code from the supplied file. This will overwrite the default command (home all axes [G28]).',value:''},
//{opt:'--end-gcode',name:'Load final G-code from the supplied file. This will overwrite the default commands (turn off temperature [M104 S0], home X axis [G28 X], disable motors [M84]).',value:''},
//{opt:'--layer-gcode',name:'Load layer-change G-code from the supplied file (default: nothing).',value:''},
//{opt:'--toolchange-gcode',name:'Load tool-change G-code from the supplied file (default: nothing).',value:''},
{opt:'--seam-position',name:'Position of loop starting points (random/nearest/aligned, default: aligned).',value:['aligned','random','nearest']},
{opt:'--external-perimeters-first',name:'Reverse perimeter order. (default: no)',value:['no','yes']},
{opt:'--spiral-vase',name:'Experimental option to raise Z gradually when printing single-walled vases (default: no)',value:['no','yes']},
{opt:'--only-retract-when-crossing-perimeters',name:'Disable retraction when travelling between infill paths inside the same island. (default: no)',value:['no','yes']},
{opt:'--solid-infill-below-area',name:'Force solid infill when a region has a smaller area than this threshold (mm^2, default: 70)',value:'70'},
{opt:'--infill-only-where-needed',name:'Only infill under ceilings (default: no)',value:['no','yes']},
{opt:'--infill-first',name:'Make infill before perimeters (default: no)',value:['no','yes']},
]},
{section:'Quality Options', options: [
{opt:'--extra-perimeters',name:'Add more perimeters when needed (default: yes)',value:['yes','no']},
{opt:'--avoid-crossing-perimeters',name:'Optimize travel moves so that no perimeters are crossed (default: no)',value:['no','yes']},
{opt:'--thin-walls',name:'Detect single-width walls (default: yes)',value:['yes','no']},
{opt:'--overhangs',name:'Experimental option to use bridge flow, speed and fan for overhangs (default: yes)',value:['yes','no']},
]},
{section:'Support Material Options', options: [
{opt:'--support-material',name:'Generate support material for overhangs',value:['yes','no']},
{opt:'--support-material-threshold',name:'Overhang threshold angle (range: 0-90, set 0 for automatic detection, default: 0)',value:'0'},
{opt:'--support-material-pattern',name:'Pattern to use for support material (default: honeycomb)',value:['honeycomb','3dhoneycomb','concentric','line','hilbertcurve','octagramspiral','flowsnake','rectilinear','archimedeanchords']},
{opt:'--support-material-spacing',name:'Spacing between pattern lines (mm, default: 2.5)',value:'2.5'},
{opt:'--support-material-angle',name:'Support material angle in degrees (range: 0-90, default: 0)',value:'0'},
{opt:'--support-material-interface-layers',name:'Number of perpendicular layers between support material and object (0+, default: 3)',value:'3'},
{opt:'--support-material-interface-spacing',name:'Spacing between interface pattern lines (mm, set 0 to get a solid layer, default: 0)',value:'0'},
{opt:'--raft-layers',name:'Number of layers to raise the printed objects by (range: 0+, default: 0)',value:'0'},
{opt:'--support-material-enforce-layers',name:'Enforce support material on the specified number of layers from bottom, regardless of support-material and threshold (0+, default: 0)',value:'0'},
{opt:'--dont-support-bridges',name:'Experimental option for preventing support material from being generated under bridged areas (default: yes)',value:['yes','no']},
]},
{section:'Retraction Options', options: [
{opt:'--retract-length',name:'Length of retraction in mm when pausing extrusion (default: 1)',value:'1'},
{opt:'--retract-speed',name:'Speed for retraction in mm/s (default: 30)',value:'30'},
{opt:'--retract-restart-extra',name:'Additional amount of filament in mm to push after compensating retraction (default: 0)',value:'0'},
{opt:'--retract-before-travel',name:'Only retract before travel moves of this length in mm (default: 2)',value:'2'},
{opt:'--retract-lift',name:'Lift Z by the given distance in mm when retracting (default: 0)',value:'0'},
{opt:'--retract-layer-change',name:'Enforce a retraction before each Z move (default: yes)',value:['yes','no']},
{opt:'--wipe',name:'Wipe the nozzle while doing a retraction (default: no)',value:['no','yes']},
]},
{section:'Retraction Options for Multi-Extruder Setups', options: [
{opt:'--retract-length-toolchange',name:'Length of retraction in mm when disabling tool (default: 1)',value:'1'},
{opt:'--retract-restart-extra-toolchange',name:'Additional amount of filament in mm to push after switching tool (default: 0)',value:'0'},
]},
{section:'Cooling Options', options: [
{opt:'--cooling',name:'Enable fan and cooling control',value:['yes','no']},
{opt:'--min-fan-speed',name:'Minimum fan speed as % (default: 35)',value:'35'},
{opt:'--max-fan-speed',name:'Maximum fan speed as % (default: 100)',value:'100'},
{opt:'--bridge-fan-speed',name:'Fan speed to use when bridging as % (default: 100)',value:'100'},
{opt:'--fan-below-layer-time',name:'Enable fan if layer print time is below this approximate number of seconds (default: 60)',value:'60'},
{opt:'--slowdown-below-layer-time',name:'Slow down if layer print time is below this approximate number of seconds (default: 30)',value:'30'},
{opt:'--min-print-speed',name:'Minimum print speed (mm/s, default: 10)',value:'10'},
{opt:'--disable-fan-first-layers',name:'Disable fan for the first N layers (default: 1)',value:'1'},
{opt:'--fan-always-on',name:'Keep fan always on at min fan speed, even for layers that do not need cooling',value:['no','yes']},
]},
{section:'Skirt Options', options: [
{opt:'--skirts',name:'Number of skirts to draw (0+, default: 1)',value:'1'},
{opt:'--skirt-distance',name:'Distance in mm between innermost skirt and object (default: 6)',value:'6'},
{opt:'--skirt-height',name:'Height of skirts to draw (expressed in layers, 0+, default: 1)',value:'1'},
{opt:'--min-skirt-length',name:'Generate no less than the number of loops required to consume this length of filament on the first layer, for each extruder (mm, 0+, default: 0)',value:'0'},
{opt:'--brim-width',name:'Width of the brim that will get added to each object to help adhesion (mm, default: 0)',value:'0'},
]},
{section:'Transform Options', options: [
{opt:'--scale',name:'Factor for scaling input object (default: 1)',value:'1'},
{opt:'--rotate',name:'Rotation angle in degrees (0-360, default: 0)',value:'0'},
{opt:'--duplicate',name:'Number of items with auto-arrange (1+, default: 1)',value:'1'},
{opt:'--duplicate-grid',name:'Number of items with grid arrangement (default: 1,1)',value:'1,1'},
{opt:'--duplicate-distance',name:'Distance in mm between copies (default: 6)',value:'6'},
{opt:'--xy-size-compensation',name:'Grow/shrink objects by the configured absolute distance (mm, default: 0)',value:'0'},
]},
{section:'Sequential Printing Options', options: [
{opt:'--complete-objects',name:'When printing multiple objects and/or copies, complete each one before starting the next one; watch out for extruder collisions (default: no)',value:['no','yes']},
{opt:'--extruder-clearance-radius',name:'Radius in mm above which extruder will not collide with anything (default: 20)',value:'20'},
{opt:'--extruder-clearance-height',name:'Maximum vertical extruder depth; i.e. vertical distance from extruder tip and carriage bottom (default: 20)',value:'20'},
]},
{section:'Flow Options', options: [
{opt:'--extrusion-width',name:'Set extrusion width manually; it accepts either an absolute value in mm (like 0.65) or a percentage over layer height (like 200%)',value:''},
{opt:'--first-layer-extrusion-width',name:'Set a different extrusion width for first layer',value:''},
{opt:'--perimeter-extrusion-width',name:'Set a different extrusion width for perimeters',value:''},
{opt:'--external-perimeter-extrusion-width',name:'Set a different extrusion width for external perimeters',value:''},
{opt:'--infill-extrusion-width',name:'Set a different extrusion width for infill',value:''},
{opt:'--solid-infill-extrusion-width',name:'Set a different extrusion width for solid infill',value:''},
{opt:'--top-infill-extrusion-width',name:'Set a different extrusion width for top infill',value:''},
{opt:'--support-material-extrusion-width',name:'Set a different extrusion width for support material',value:''},
{opt:'--bridge-flow-ratio',name:'Multiplier for extrusion when bridging (> 0, default: 1)',value:''},
]},
{section:'Multiple Extruder Options', options: [
{opt:'--extruder-offset',name:'Offset of each extruder, if firmware does not handle the displacement (can be specified multiple times, default: 0x0)',value:'0x0'},
{opt:'--perimeter-extruder',name:'Extruder to use for perimeters (1+, default: 1)',value:'1'},
{opt:'--infill-extruder',name:'Extruder to use for infill (1+, default: 1)',value:'1'},
{opt:'--support-material-extruder',name:'Extruder to use for support material (1+, default: 1)',value:'1'},
{opt:'--support-material-interface-extruder',name:'Extruder to use for support material interface (1+, default: 1)',value:'1'},
{opt:'--ooze-prevention',name:'Drop temperature and park extruders outside a full skirt for automatic wiping (default: no)',value:['no','yes']},
{opt:'--ooze-prevention',name:'Drop temperature and park extruders outside a full skirt for automatic wiping (default: no)',value:['no','yes']},
{opt:'--standby-temperature-delta',name:'Temperature difference to be applied when an extruder is not active and ooze-prevention is enabled (default: -5)',value:'-5'},
]}

],'cura':[
// https://github.com/daid/Cura/blob/SteamEngine/Cura/util/profile.py#L1039 <-- this makes it harder than it has to be to use CuraEngine
// https://github.com/daid/Cura/blob/SteamEngine/Cura/util/sliceEngine.py#L446
// https://github.com/Ultimaker/CuraEngine/blob/master/src/settings.cpp

/*
python code to export print options from Cura
add to Cura/util/sliceEngine.py #570 before return settings
this will print the exact options Cura is sending to CuraEngine from the console
for the settings you have selected in the UI
===
                # print settings
                print str(len(settings))
                for item in settings.iterkeys():
                        if (item != 'endCode' and item != 'postSwitchExtruderCode' and item != 'preSwitchExtruderCode' and item != 'startCode'):
                                print "{opt:':"+str(item)+"',name:'"+str(item)+"',value:'"+str(settings[item])+"'},"
                print "###### startCode ######"
                print str(settings['startCode'])
                print "###### endCode ######"
                print str(settings['endCode'])
===
useful to figure out how Cura is sending options to CuraEngine
*/

{section:'Quality', options: [
{opt:'layerThickness',name:'Layer Height (mm) - Layers thicker than 80% of your nozzle size usually give bad results',value:'.4'},
{opt:'initialLayerThickness',name:'First Layer Height (mm) - Thickness of the first layer',value:'.3'},
{opt:'insetCount',name:'Horizontal Shell Count - Number of perimeters for horizontal layers',value:'4'},
]},

{section:'Fill', options: [
{opt:'fillDensity',name:'Fill Density (%) - This controls how densely filled the inside of your print will be',value:'20'}, // sets sparseInfillLineDistance needs to set downSkinCount and upSkinCount to 10000 if 100%
{opt:'upSkinCount',name:'Solid Top Layers - Number of layers on the top of the object which are solid',value:'5'},
{opt:'downSkinCount',name:'Solid Bottom Layers - Number of layers on the bottom of the object which are solid',value:'5'},
]},

{section:'Temperature', options: [
// extruder and bed temp are set in startCode
{opt:'printTemp',name:'Print Temperature (C) - Temperature used for printing, set at 0 to pre-heat yourself',value:'200'},
{opt:'bedTemp',name:'Bed Temperature (C) - Bed Temperature used for printing, set at 0 to pre-heat yourself',value:'0'},
]},

{section:'Printing Speed', options: [
{opt:'infillSpeed',name:'Infill Speed (mm/s) - Speed at which infill parts are printed',value:'40'},
{opt:'inset0Speed',name:'Perimeter Speed (mm/s) - Speed at which inner and outer perimeters are printed',value:'30'},
{opt:'printSpeed',name:'Base Print Speed (mm/s) - Base print speed, this is only used in place of Infill and Perimeter Speed if they are set to 0',value:'30'},
{opt:'moveSpeed',name:'Travel Speed (mm/s) - Speed at which non printing moves happen',value:'100'},
{opt:'initialLayerSpeed',name:'First Layer Speed (mm/s) - Speed at which to print the first layer, slower leads to better adhesion',value:'15'},
]},

{section:'Retraction', options: [
{opt:'retractionAmount',name:'Retraction Distance (mm) - Amount to retract, set to 0 for no retraction',value:'4.5'},
{opt:'retractionSpeed',name:'Retraction Speed (mm/s) - Speed at which to retract filament',value:'40'},
{opt:'retractionZHop',name:'Retraction Z Hop (mm) - Amount to lift Z axis on retract',value:'0'},
]},

{section:'Filament', options: [
{opt:'filamentDiameter',name:'Diameter (mm) - Diameter of your filament measured as accurately as possible',value:'3'},
{opt:'filamentFlow',name:'Flow (%) - Flow compensation, the amount of material extruded is multiplied by this value',value:'100'},
]},

{section:'Machine', options: [
// nozzle size and shell width somehow
{opt:'posx',name:'Center X (mm) - X Coordinate to center the print around',value:'100'},
{opt:'posy',name:'Center Y (mm) - Y Coordinate to center the print around',value:'100'},
{opt:'extrusionWidth',name:'Nozzle Size (mm) - Diameter of nozzle',value:'.4'},
]},

{section:'Cool', options: [
{opt:'minimalLayerTime',name:'Minimal Layer Time (sec) - Printer must spend at least this long per layer to let things cool down',value:'5'},
]},

// these have different values in CuraEngine then a default test with Cura
//{opt:'fanFullOnLayerNr',name:'fanFullOnLayerNr',value:'1'}, // this is set to 2 in CuraEngine but 1 in Cura
//{opt:'extruderOffset[1].X',name:'extruderOffset[1].X',value:'0'}, // need to test
//{opt:'extruderOffset[1].Y',name:'extruderOffset[1].Y',value:'21600'}, // need to test
//{opt:'fixHorrible',name:'fixHorrible',value:'1'}, // this is set to 0 in CuraEngine
//{opt:'layer0extrusionWidth',name:'layer0extrusionWidth',value:'500'}, // set to 600 in CuraEngine
//{opt:'retractionAmountExtruderSwitch',name:'retractionAmountExtruderSwitch',value:'16500'}, // set to 14500 in CuraEngine
//{opt:'multiVolumeOverlap',name:'multiVolumeOverlap',value:'150'}, // set to 0 in CuraEngine

// these should already be set by CuraEngine
//{opt:'supportLineDistance',name:'supportLineDistance',value:'3333'}, // set to sparseInfillLineDistance in CuraEngine
//{opt:'sparseInfillLineDistance',name:'sparseInfillLineDistance',value:'2500'}, // set to 100 * extrusionWidth / 20 in CuraEngine this is the formula for fill density (100*extrusionWidth)/20

{section:'Skirt', options: [
//{opt:'skirtMinLength',name:'skirtMinLength',value:'150000'}, // set to 0 in CuraEngine but shouldn't matter
{opt:'skirtLineCount',name:'Skirt Line Count - Number of lines to draw for the skirt, set to 0 to not use a skirt.  For a brim set a high Skirt Line Count (20) and a Skirt Distance of 0',value:'1'},
{opt:'skirtDistance',name:'Skirt Distance (mm) - Distance of skirt from perimeter of printed object',value:'10'},
]},

{section:'Support', options: [
{opt:'supportType',name:'Support Type (FIX) - Type of support structure to build.  Touching Buildplate only creates support where the support structure will touch the build platform, Everywhere creates support even on top parts of the model.',value:['None','Touching Buildplate','Everywhere']},
{opt:'platformAdhesionType',name:'Platform Adhesion Type - Brim adds a single layer thick flat area around your object which is easily cut off and Raster adds a thick raster below the object and a thin interface between this and your object.',value:['None','Brim','Raft']},
]},

{section:'Start and End Gcode', options: [
//T0 // no idea why this was in startCode from Cura test
{opt:'startCode',name:'Start Gcode - Gcode to prepend to file',value:'G21        ;metric values\nG90        ;absolute positioning\nM82        ;set extruder to absolute mode\nM107       ;start with the fan off\nG28 ;move to min endstops\nG1 Z15.0 F9000 ;move the platform down 15mm\nG92 E0                  ;zero the extruded length\nG1 F200 E3              ;extrude 3mm of feed stock\nG92 E0                  ;zero the extruded length again\nG1 F9000\n;Put printing message on LCD screen\nM117 Printing...'},
{opt:'endCode',name:'End Gcode - Gcode to append to file',value:'M104 S0                     ;extruder heater off\nM140 S0                     ;heated bed heater off (if you have it)\nG91                                    ;relative positioning\nG1 E-1 F300                            ;retract the filament a bit before lifting the nozzle, to release some of the pressure\nG1 Z+0.5 E-5 X-20 Y-20 F9000 ;move Z up a bit and retract filament even more\nG28 ;home\nM84                         ;steppers off\nG90                         ;absolute positioning'},
]},

]}

module.exports = slBaseOpts;

