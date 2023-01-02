export const allSubParts = [
    {partType:'front_hull',displayName:'Front Hull',cost:200, weight:80, armor:5},
    {partType:'middle_hull',displayName:'Middle Hull',cost:200, weight:100, armor:5},
    {partType:'back_hull',displayName:'Back Hull',cost:20, weight:120, armor:5},
    {partType:'top_hatch',displayName:'Hatch',cost:20,weight:20,accessible:"Through Top"},
    {partType:'flipper',displayName:'Flipper',cost:50,weight:5},
    {partType:'side_thruster',displayName:'Thruster',cost:50,weight:5,thrust:50},
    {partType:'animProp_',displayName:'Propeller',cost:30,weight:10,thrust:100},
    {partType:'top_plate',displayName:'Top Armor',cost:100,weight:15, armor:20},
    {partType:'back_armor',displayName:'Bottom Armor',cost:150,weight:15, armor:30},
    {partType:'frontHardpoint',displayName:'Hardpoint',cost:60,weight:10, armor:3},
    {partType:'window',displayName:'Window',cost:10,weight:0,visibility:10},
    {partType:'flair1',displayName:'68 Flair',cost:10,weight:0},
    {partType:'flair2',displayName:'Wing Flair',cost:10,weight:0},
    {partType:'miningLaser',displayName:'Mining Laser',cost:60,weight:10, firepower:5,miningPower:10},
    {partType:[['gun_turret','gun_base'],true,'gun_assembly'],displayName:'Cannon',cost:200,weight:15, firepower:15},
];

// Part stats:
// weight
// firepower
// accessible
// thrust
// armor
// visibility
// miningPower