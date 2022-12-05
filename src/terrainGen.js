var config = {
    width: 1200,
    height: 800,
    type: Phaser.AUTO,
    scene: {
        preload:preload,
        create: create,
        update: update
    }
};



var game = new Phaser.Game(config);
var polygon;

var graphics;

var pointerX = 0;
var pointerY = 0;
var monsterHead;
var speed = 0;
var time = 0;

function preload()
{
    this.load.multiatlas('monsters', 'assets/monsters.json', 'assets');
}

function create ()
{
    monsterHead = this.add.sprite(500, 500, 'monsters', 'wormHead.png');
    monsterBody1 = this.add.sprite(500, 500, 'monsters', 'wormBody1.png');
    monsterBody2 = this.add.sprite(500, 500, 'monsters', 'wormBody2.png');
    monsterBody3 = this.add.sprite(500, 500, 'monsters', 'wormBody3.png');
    monsterTail = this.add.sprite(500, 500, 'monsters', 'wormTail.png');

    monsterHead.rotVel = 0;
    monsterBody1.rotVel = 0;
    monsterBody2.rotVel = 0;
    monsterBody3.rotVel = 0;
    monsterTail.rotVel = 0;
    

    this.input.on('pointermove', function (pointer)
    {
        pointerX = pointer.x;
        pointerY = pointer.y;
    }, this);
}

function update ()
{


}

function wormStuff(){
    time += 0.003;
    variance = 1+Math.sin(time);
    
    var tar = Math.atan2(pointerY - monsterHead.y, pointerX - monsterHead.x ) ;
    if (monsterHead.rotation - tar > Math.PI){
        tar += 2*Math.PI;
    } else if(monsterHead.rotation - tar < -Math.PI){
        tar -= 2*Math.PI;
    }
    if(monsterHead.rotation > tar){
        monsterHead.rotVel -= 0.00002+(Math.abs( tar-monsterHead.rotation)/(3000 + (3000/variance)));
    } else {
        monsterHead.rotVel += 0.00002+(Math.abs( tar-monsterHead.rotation)/(3000 + (3000/variance)));
    }

    monsterHead.rotVel /= 1.015;
    monsterHead.rotation = (monsterHead.rotation + monsterHead.rotVel) % (Math.PI * 2);

    var extraSpeed = 2+(Math.PI/2)-(Math.abs( tar-monsterHead.rotation));

    speed += extraSpeed/200;
    speed /= 1.004;

    monsterHead.x += (0.1+speed) * Math.cos(monsterHead.rotation);
    monsterHead.y += (0.1+speed) * Math.sin(monsterHead.rotation);

    followSegment(monsterBody1, monsterHead);
    followSegment(monsterBody2, monsterBody1);
    followSegment(monsterBody3, monsterBody2);
    followSegment(monsterTail, monsterBody3);
}

function followSegment(follower, target)
{
    var tar = Math.atan2(target.y - follower.y, target.x - follower.x ) ;

    follower.x = target.x
    follower.y = target.y
    follower.rotation = tar;

    follower.x -= 33 * Math.cos(follower.rotation);
    follower.y -= 33 * Math.sin(follower.rotation);
}


//Hilarious atempts terrain generation

function makeTerrain(context)
{
    var basicShape = [
        200, 150,
        400, 200,
        600, 150,
        750, 300,
        400, 450,
        200, 5000,
        50, 5000,
        200, 150,
    ]

    var offset = new Offset();
    var margined = offset.data(groupArray(basicShape)).margin(20);
    var margined2 = offset.data(groupArray(basicShape)).margin(30);
        
    terrainGraphics = context.add.graphics();

    insideTerrainBasic = new Phaser.Geom.Polygon(explodeArray(margined));
    insideTerrainRetop = new Phaser.Geom.Polygon(retopologize(insideTerrainBasic.getPoints(50)));

    outsideTerrainBasic = new Phaser.Geom.Polygon(explodeArray(margined2));
    outsideTerrainRetop = new Phaser.Geom.Polygon(retopologize(outsideTerrainBasic.getPoints(50)));

    polygonHighlight = new Phaser.Geom.Polygon(noiseArray(retopologize(insideTerrainBasic.getPoints(100)),20));
    polygonShadow = new Phaser.Geom.Polygon(noiseArray(retopologize(insideTerrainBasic.getPoints(80)),20));
    
    const shape = context.make.graphics();
    shape.fillStyle(0xffffff);
    shape.fillPoints(insideTerrainRetop.points, true);
    const terrainMask = shape.createGeometryMask();

    const shapeOutside = context.make.graphics();
    shapeOutside.fillStyle(0xffffff);
    shapeOutside.fillPoints(outsideTerrainRetop.points, true);

    terrainGraphics.fillStyle( 0x333399);
    terrainGraphics.fillPoints(outsideTerrainRetop.points, true);

    terrainGraphics.fillStyle( 0x97C5E7);
    terrainGraphics.fillPoints(insideTerrainRetop.points, true);

    const terrainHighlight = context.add.graphics();
    terrainHighlight.fillStyle(0x609BC7);
    terrainHighlight.fillPoints(polygonHighlight.points, true);
    terrainHighlight.y += 20;
    terrainHighlight.x -= 10;
    terrainHighlight.setMask(terrainMask);

}

function retopologize(topology)
{
    var retopologizedArray = [];
    for(var i = 0; i<topology.length;i++){
        retopologizedArray.push(topology[i].x,topology[i].y);
    }
    return retopologizedArray;
}

function explodeArray(array)
{
    var explodedArray = [];
    for(var i = 0;i<array[0].length;i++){
        for(var j = 0;j<array[0][i].length; j++){
            if(array[0][i][j] != undefined){
                explodedArray.push(array[0][i][j]);
            };
        }
    }
    return explodedArray;
}

function groupArray(array)
{
    groupedArray = [];
    for(var i=0;i<array.length;i+=2){
        groupedArray.push([array[i],array[i+1]])
    }
    return groupedArray;
}

function noiseArray(array,amount)
{
    noisedArray = [];
    for(var i=0;i<array.length;i++){
        noisedArray.push(array[i]+(Math.random()*amount));
    }
    return noisedArray;
}