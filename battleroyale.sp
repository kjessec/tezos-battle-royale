import smartpy as sp

class BattleRoyale(sp.Contract):
    def __init__(self):
            self.init(
                players = sp.map(
                    l = {},
                    tkey = sp.TAddress,
                    tvalue = sp.TPair(
                        sp.TNat, # register(), 나한테 부여되는 절대 인덱스. currentPlayer와의 비교를 통해 나의 턴인지 구분하기 위해 필요.
                        sp.TPair(sp.TInt, sp.TInt) # 나의 지금 좌표
                    )
                ),
                currentPlayer = 0,
                isStarted = False,
            )
            
    @sp.entry_point
    def register(self):
        
        # 만약 data.isStarted = True이면, register 불가.
        sp.if (self.data.isStarted == True):
            sp.failwith('Game already started')
        
        # 최대 인원을 넘지 않는지 체크
        sp.if ((sp.len(self.data.players) + 1) > 4):
            sp.failwith('Max players registered')
        
        # 이미 등록된 플레이어인지 아닌지 체크
        sp.if (self.data.players.contains(sp.sender)):
            sp.failwith('Already registered')
        
        
        # 
        my_player_id = sp.as_nat(sp.to_int(sp.len(self.data.players)))
        
        # 시작점
        # (5x5)
        coordinates = sp.local('coordinates', sp.pair(0, 0))
        
        sp.if my_player_id == 0:
            coordinates.value = sp.pair(1,1)
        sp.if my_player_id == 1:
            coordinates.value = sp.pair(1,3)
        sp.if my_player_id == 2:
            coordinates.value = sp.pair(3,1)
        sp.if my_player_id == 3:
            coordinates.value = sp.pair(3,3)
        
        # 플레이어 리스트에 추가
        self.data.players[sp.sender] = sp.pair(
            my_player_id,
            coordinates.value
        )
        
    @sp.entry_point
    def start(self):
        # 인원이 차지 않아도 시작 가능
        self.data.isStarted = True
        
    # 4방 움직이는 함수들
    # 자기 자리에서 상하좌우 4자리로밖에 못움직이니, 함수를 따로 만든다.
    # 간단하게 하기 위해서...
    @sp.entry_point
    def play_top(self, params):
        
        # 게임이 시작했는가?
        self.is_game_started()
        
        # 나의 턴인지?
        self.is_current_user()
        
        next_point = sp.local('next_point', sp.pair(
            sp.fst(sp.snd(self.data.players[sp.sender])),
            sp.snd(sp.snd(self.data.players[sp.sender])),
        ))
        
        next_point.value = sp.pair(
            sp.fst(next_point.value) - 1,
            sp.snd(next_point.value)
        )
        
        # 에러
        sp.if sp.fst(next_point.value) < 0:
            sp.failwith('Can\'t move outside of the board')
            
        self.data.players[sp.sender] = sp.pair(
            sp.fst(self.data.players[sp.sender]),
            next_point.value
        )
        
        # 판단
        self.judge()
        
        # play done
        self.done_play()
        
        
    @sp.entry_point
    def play_right(self, params):
        # 게임이 시작했는가?
        self.is_game_started()
        
        # 나의 턴인지?
        self.is_current_user()
        
        next_point = sp.local('next_point', sp.pair(
            sp.fst(sp.snd(self.data.players[sp.sender])),
            sp.snd(sp.snd(self.data.players[sp.sender])),
        ))
        
        next_point.value = sp.pair(
            sp.fst(next_point.value),
            sp.snd(next_point.value) + 1
        )
        
        # 에러
        sp.if sp.snd(next_point.value) > 4:
            sp.failwith('Can\'t move outside of the board')
            
        self.data.players[sp.sender] = sp.pair(
            sp.fst(self.data.players[sp.sender]),
            next_point.value
        )
        
        # 판단
        self.judge()
        
        # play done
        self.done_play()
        
    @sp.entry_point
    def play_bottom(self, params):
        # 게임이 시작했는가?
        self.is_game_started()
        
        # 나의 턴인지?
        self.is_current_user()
        
        next_point = sp.local('next_point', sp.pair(
            sp.fst(sp.snd(self.data.players[sp.sender])),
            sp.snd(sp.snd(self.data.players[sp.sender])),
        ))
        
        next_point.value = sp.pair(
            sp.fst(next_point.value) + 1,
            sp.snd(next_point.value)
        )
        
        # 에러
        sp.if sp.fst(next_point.value) > 4:
            sp.failwith('Can\'t move outside of the board')
            
        self.data.players[sp.sender] = sp.pair(
            sp.fst(self.data.players[sp.sender]),
            next_point.value
        )
        
       # 판단
        self.judge()
        
        # play done
        self.done_play()
        
    @sp.entry_point
    def play_left(self, params):
        # 게임이 시작했는가?
        self.is_game_started()
        
        # 나의 턴인지?
        self.is_current_user()
        
        next_point = sp.local('next_point', sp.pair(
            sp.fst(sp.snd(self.data.players[sp.sender])),
            sp.snd(sp.snd(self.data.players[sp.sender])),
        ))
        
        next_point.value = sp.pair(
            sp.fst(next_point.value),
            sp.snd(next_point.value) - 1
        )
        
        # 에러
        sp.if sp.snd(next_point.value) < 0:
            sp.failwith('Can\'t move outside of the board')
            
        self.data.players[sp.sender] = sp.pair(
            sp.fst(self.data.players[sp.sender]),
            next_point.value
        )
        
       # 판단
        self.judge()
        
        # play done
        self.done_play()
        
    # 유틸리티 함수
    def is_current_user(self):
        sp.if (sp.fst(self.data.players[sp.sender]) != self.data.currentPlayer):
            sp.failwith('Not your turn')
            
    # 유틸리티 - 게임이 시작했는가?
    def is_game_started(self):
        sp.if (self.data.isStarted != True):
            sp.failwith('Game has not yet started')
            
    # 유틸리티 - 다음 플레이어 턴으로 넘김
    def done_play(self): 
        self.data.currentPlayer = (self.data.currentPlayer + 1) % 4 # 0, 1, 2, 3
        
    # overlap detection
    def judge(self):
        return True
        

@sp.add_test(name = "BattleRoyale")
def test():
    c1 = BattleRoyale()
    scenario = sp.test_scenario()
    scenario += c1
    
    scenario.h2('Register')
    scenario += c1.register().run(sender = sp.address('tz11'))
    scenario += c1.register().run(sender = sp.address('tz13'))
    scenario += c1.register().run(sender = sp.address('tz31'))
    scenario += c1.register().run(sender = sp.address('tz33'))
    scenario += c1.register().run(valid=False, sender = sp.address('tz3xx'))


    scenario.h2("Start")
    scenario += c1.start().run()
    scenario += c1.play_top().run(valid=False, sender = sp.address('tz13'))
    scenario += c1.play_top().run(valid=True, sender = sp.address('tz11'))
    scenario += c1.play_top().run(valid=True, sender = sp.address('tz13'))
    scenario += c1.play_top().run(valid=True, sender = sp.address('tz31'))
    scenario += c1.play_top().run(valid=True, sender = sp.address('tz33'))
    scenario += c1.play_right().run(valid=True, sender = sp.address('tz11'))
