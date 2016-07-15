//オブジェクト指向なjavascript

//継承システム
var inherits = function(childCtor, parentCtor) {
  Object.setPrototypeOf(childCtor.prototype, parentCtor.prototype);
};
//////////////////////////////////////////////////////////////////////

//class Team
var Team = function(team,manager,mascot){
    //ここがコンストラクタになる
    //メンバ変数には常に.thisをつける
    this.team = team;
    this.manager = manager;
    this.mascot = mascot;
};

//関数を定義するときにprototype
Team.prototype.showTeam = function(){
    console.log(this.team);//メンバ変数には常に.thisをつける
}
//変数のデフォ値(インスタンスが生まれた瞬間に代入される)もprototype
Team.prototype.team = "Swallows";
Team.prototype.manager = "Manaka";
Team.prototype.mascot = "Tsubakurou";

//////////////////////////////////////////////////////////////////////

//class Player
var Player = function(name,position,team){
    //ここがコンストラクタになる
    //メンバ変数には常に.thisをつける
    Team.call(this,team,"Manaka","Tsubami");//親クラスのコンストラクタ
    this.name = name;
    this.position = position;
};

inherits(Player,Team);//継承

//関数を定義するときにprototype
Player.prototype.showProfile = function(){
    console.log("Name:" + this.name + " / Position:" + this.position + "\n");
};
//変数のデフォ値(インスタンスが生まれた瞬間に代入される)もprototype

//////////////////////////////////////////////////////////////////////

//インスタンス
var yamada = new Player("Yamada",4,"Yakult");
var kawabata = new Player("kawabata",5,"Swallows")

//
yamada.showProfile();
kawabata.showProfile();
console.log("Yamada's manager:" + yamada.manager);

yamada.position = 3;

yamada.showProfile();
console.log(kawabata.mascot);
yamada.showTeam();
