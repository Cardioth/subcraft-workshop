//Hull widths
const BHW = 340;
const FHW = 168;
const MHW = 249;

export const nodeStructure = JSON.stringify({
    rootNode:{
        name:'rootNode', x: 0, y: -102.5, subNodes: [
            {part:'middle_hull',x:0,y:0,engaged: false, connectedWith: 'M'}, 
            {part:'front_hull',x:0,y:0,engaged: false, connectedWith: 'M'}, 
            {part:'back_hull',x:0,y:0,engaged: false, connectedWith: 'M'},
        ],
    },
    front_hull:{
        name:'front_hull',subNodes: [
            {part:'middle_hull',x:(MHW+FHW)/2,y:0,engaged: false, connectedWith: 'A'},
            {part:'side_thruster',x:30,y:0,engaged: false, connectedWith: 'F'},
            {part:'window',x:30,y:0,engaged: false, connectedWith: 'F'},
            {part:'flair1',x:30,y:-40,engaged: false, connectedWith: 'F'},
            {part:'flair2',x:30,y:-40,engaged: false, connectedWith: 'F'},
            {part:'frontHardpoint',x:-50,y:85,engaged: false, connectedWith: 'G'},
        ], 
    },
    middle_hull:{
        name:'middle_hull',subNodes: [
            {part:'front_hull',x:(FHW+MHW)/2,y:0,engaged: false, flipped:true, connectedWith: 'A'},
            {part:'front_hull',x:-(FHW+MHW)/2,y:0,engaged: false, connectedWith: 'B'},
            {part:'middle_hull',x:MHW,y:0,engaged: false, connectedWith: 'A'},
            {part:'middle_hull',x:-MHW,y:0,engaged: false, connectedWith: 'B'},
            {part:'back_hull',x:(BHW+MHW)/2,y:0,engaged: false, connectedWith: 'A'},
            {part:'back_hull',x:-(BHW+MHW)/2,y:0,engaged: false, flipped:true, connectedWith: 'B'},
            {part:'flipper',x:-80,y:70,engaged: false, connectedWith: 'C'},
            {part:'flipper',x:80,y:70,engaged: false, connectedWith: 'C'},
            {part:'top_hatch',x:-80,y:-155,engaged: false, connectedWith: 'D'},
            {part:'top_plate',x:-80,y:-80,engaged: false, connectedWith: 'D'},
            {part:'gun_assembly',x:-80,y:-135,engaged: false, connectedWith: 'D'},
            {part:'top_hatch',x:80,y:-155,engaged: false, connectedWith: 'E'},
            {part:'top_plate',x:80,y:-80,engaged: false, connectedWith: 'E'},
            {part:'gun_assembly',x:80,y:-135,engaged: false, connectedWith: 'E'},
            {part:'side_thruster',x:0,y:0,engaged: false, connectedWith: 'F'},
            {part:'window',x:0,y:0,engaged: false, connectedWith: 'F'},
            {part:'flair1',x:0,y:-40,engaged: false, connectedWith: 'F'},
            {part:'flair2',x:0,y:-40,engaged: false, connectedWith: 'F'},
            {part:'gun_assembly',x:0,y:135,engaged: false, connectedWith: 'H', rotated:180},
        ], 
    },
    back_hull:{
        name:'back_hull',subNodes: [
            {part:'back_armor',x:-120,y:110,engaged: false, connectedWith: 'G'},
            {part:'top_plate',x:-120,y:-80,engaged: false, connectedWith: 'E'},
            {part:'gun_assembly',x:-120,y:-135,engaged: false, connectedWith: 'E'},
            {part:'middle_hull',x:-(MHW+BHW)/2,y:0,engaged: false, connectedWith: 'B'},
            {part:'side_thruster',x:-50,y:0,engaged: false, connectedWith: 'F'},
            {part:'window',x:-50,y:0,engaged: false, connectedWith: 'F'},
            {part:'flair1',x:-50,y:-40,engaged: false, connectedWith: 'F'},
            {part:'flair2',x:-50,y:-40,engaged: false, connectedWith: 'F'},
            {part:'animProp_',x:155,y:-25,engaged: false, connectedWith: 'D'},
            {part:'gun_assembly',x:-20,y:100,engaged: false, connectedWith: 'H', rotated:158},
        ], 
    },
    side_thruster:{
        name:'side_thruster',subNodes: [], 
    },
    window:{
        name:'window',subNodes: [], 
    },
    animProp_:{
        name:'animProp_',subNodes: [], 
    },
    flipper:{
        name:'flipper',subNodes: [], 
    },
    top_hatch:{
        name:'top_hatch',subNodes: [], 
    },
    top_plate:{
        name:'top_plate',subNodes: [], 
    },
    gun_assembly:{
        name:'gun_assembly',subNodes: [], 
    },
    back_armor:{
        name:'back_armor',subNodes: [], 
    },
    frontHardpoint:{
        name:'frontHardpoint',subNodes: [
            {part:'miningLaser',x:-60,y:40,engaged: false, connectedWith: 'K'},
        ], 
    },
    flair1:{
        name:'flair1',subNodes: [], 
    },
    flair2:{
        name:'flair2',subNodes: [], 
    },
    miningLaser:{
        name:'miningLaser',subNodes: [], 
    },
});