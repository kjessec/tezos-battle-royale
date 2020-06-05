import React, { useEffect, useState } from "react";
import {Tezos} from "@taquito/taquito";

Tezos.setRpcProvider('https://carthagenet.SmartPy.io')

const mapSize = 5;

// playerCoordinates = ....
const createMap = playerCoordinates => {
  const map = [];
  for (let i = 0; i < mapSize; i++) {
    const row = [];
    for (let j = 0; j < mapSize; j++) {
      row[j] = null;
    }

    map[i] = row;
  }

  playerCoordinates.forEach((coordinate, coordinateIdx) => {
    map[coordinate[0]][coordinate[1]] = coordinateIdx
  })

  return map;
};

const getContract = async () => {
  Tezos.setRpcProvider("https://carthagenet.SmartPy.io");
  const contract = await Tezos.contract.at(
    "KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk"
  );
  const storage = await contract.storage();

  console.log(storage)

  return {
    contract,
    storage
  };
};

export default () => {
  // 컨트랙트 스토리지 그대로 가져옴
  const [storage, setStorage] = useState(null)

  // 없어질 부분
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [players, setPlayers] = useState([])
  const [coordinates, setCoordinates] = useState([])

  //
  const [tempPrivateKey, setTempPrivateKey] = useState('')

  // 현재 로그인을 했는지 나타나는 불린
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const map = createMap(coordinates);

  // 최초에 컨트랙트 스토리지를 불러오는 부분
  useEffect(() => {
    getContract().then(result => {
      const { storage } = result;
      setPlayers(Array.from(storage.players.keyMap.keys()))
      
      const playerData = Array.from(storage.players.valueMap)
      const coordinates = playerData.map(data => {
        return [
          data[1][1].toNumber(),
          data[1][2].toNumber()
        ]
      })

      setCoordinates(coordinates)
    });
  }, storage);

  return (
    <div>
      <h1>The game of battle royale</h1>
      <header>
        <div>Game is {storage?.isStarted ? "running" : "not running yet"}.</div>
        <div>
          Players:
          <ul>
            {
              (players).map((player, playerIdx) => (
              <li key={player}>
                {currentTurn === playerIdx ? ">" : ""} {player}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main>
        <table style={{ border: "1px solid #000", borderCollapse: "collapse" }}>
          <tbody>
            {map.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: "1px solid #000" }}>
                {row.map((cell, cellIdx) => (
                  <td
                    style={{
                      width: 80,
                      height: 80,
                      borderLeft: "1px solid #000"
                    }}
                    key={cellIdx}
                  >
                    {(players[cell] || '').slice(0, 5) || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <footer>
        <h1>Login</h1>
        <input
          type="text"
          value={tempPrivateKey}
          onChange={ev => setTempPrivateKey(ev.currentTarget.value)}
        />
        <button
          onClick={async () => {
            const result = await Tezos.importKey(tempPrivateKey)
            console.log(result)
            alert('Logged in!')
            setIsLoggedIn(true)
            setStorage({ ...storage })
          }}
        >
          Login
        </button>
      </footer>

      {isLoggedIn && (
        <div>
          <button onClick={async () => {
            const contract = await Tezos.contract.at('KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk')
            const tx = await contract.methods.register(null).send()
            console.log('register tx', tx)

            await tx.confirmation()

            setStorage(await contract.storage())
          }}>
            Register
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div>
          <button onClick={async() => {
            const contract = await Tezos.contract.at('KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk')
            const tx = await contract.methods.start(0).send()

            console.log('starting the game...')

            await tx.confirmation()

            setIsGameStarted(true)

            setStorage(await contract.storage())

            alert('game has started')
          }}>
            Start
          </button>
        </div>
      )}


      {storage?.isStarted && (
        <div>
          <button onClick={async () => {
            const contract = await Tezos.contract.at('KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk')
            const tx = await contract.methods.play_top(0).send()
            console.log(tx)
            await tx.confirmation()

            setStorage(await contract.storage())
          }}>
            Up
          </button>
          <button onClick={async () => {
            const contract = await Tezos.contract.at('KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk')
            const tx = await contract.methods.play_right(0).send()
            console.log(tx)
            await tx.confirmation()

            setStorage(await contract.storage())
          }}>
            Right
          </button>
          <button onClick={async () => {
            const contract = await Tezos.contract.at('KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk')
            const tx = await contract.methods.play_bottom(0).send()
            console.log(tx)
            await tx.confirmation()

            setStorage(await contract.storage())
          }}>
            Bottom
          </button>
          <button onClick={async () => {
            const contract = await Tezos.contract.at('KT1Nx3G144QJt2DZDd5LP5qTPfJv8jvedkYk')
            const tx = await contract.methods.play_left(0).send()
            console.log(tx)
            await tx.confirmation()

            setStorage(await contract.storage())
          }}>
            Left
          </button>
        </div>
      )}
    </div>
  );
};

// // /////
// import { Tezos } from "@taquito/taquito";
// Tezos.setRpcProvider("https://carthagenet.SmartPy.io");

// // async function app() {
// //   try {
// //     const contract = await Tezos.contract.at(
// //       "KT19VApy2yUPxj9vTZC5ranNwGmrhv1ZSTMS"
// //     );

// //     const storage = await Tezos.contract.getStorage(
// //       "KT19VApy2yUPxj9vTZC5ranNwGmrhv1ZSTMS"
// //     );

// //     ///
// //     const orderedList = [];
// //     storage.valueMap.forEach(function(data, address) {
// //       orderedList.push({
// //         address: address,
// //         data: data
// //       });
// //     });

// //     console.log(orderedList);

// //     orderedList.sort(function(a, b) {
// //       return b.data.result.toNumber() - a.data.result.toNumber();
// //     });

// //     console.log(orderedList);

// //     // 키를 심는다
// //     await Tezos.importKey(
// //       "edskRrZKa3tkCXN1H4fJBGRDdcCaEZ5uUFLP3a3M4YMiyRM6ZX8yitz1vCwubDpjbtcuRyXpvMEvBztB5nVKFMH5fwC4eR9qes"
// //     );

// //     // // contract에서 write() 엔트리포인트를 실행시킨다
// //     // const write = await (await contract.methods
// //     //   .write("Congrats on your wedding")
// //     //   .send()).confirmation();

// //     // console.log(write);

// //     // const send = await (await contract.methods
// //     //   .add(100000, 0)
// //     //   .send()).confirmation();
// //     // console.log(send);
// //   } catch (e) {
// //     console.log(e);
// //   }
// // }

// // app();

// ////

// const getList = () => {
//   return Tezos.contract
//     .getStorage("KT1CnXngZqqdacC4JFqiXHpCq5FYtTVghWVA")
//     .then(function(storage) {
//       console.log(storage);
//     });
// };

// export default function App() {
//   useEffect(() => {
//     getList().then(console.log);
//   });

//   return <div />;
// }
