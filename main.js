let clock, camera, scene, renderer
let directionalLight
let envelopeObj
let animationStep = 'start'

init();
animate();

function init() {
  scene = new THREE.Scene();

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  camera.position.set(0, 0, 50)
  scene.add(camera)

  const loadingManager = new THREE.LoadingManager(() => {

    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener('transitionend', onTransitionEnd);

  });

  //
  class Envelope {
    constructor() {
      // 材質、紋理設定
      const envMap = new THREE.TextureLoader(loadingManager).load(
        './src/img/paper_texture.jpg'
      )
      const envBodyMap = new THREE.TextureLoader(loadingManager).load(
        './src/img/paper_texture.jpg'
      )
      envMap.wrapS = envMap.wrapT = THREE.RepeatWrapping
      envMap.repeat.set(0.03, 0.07)
      const letterMap = new THREE.TextureLoader(loadingManager).load(
        './src/img/letter_texture.jpg'
      )
      const stickerMap = new THREE.TextureLoader(loadingManager).load(
        './src/img/nue.png'
      )
      const envMat = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: envMap
      })
      const envBodyMat = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: envBodyMap
      })
      const letterMat = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: letterMap
      })
      const stickerMat = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: stickerMap
      })

      // 信封結構
      this.envelope = new THREE.Group()

      const envBodyGeo = new THREE.BoxGeometry(30, 20, 0.1)
      this.envBody = new THREE.Mesh(envBodyGeo, envBodyMat)

      const envBodyLeftGeo1 = new THREE.BoxGeometry(0.1, 20, 0.1)
      const envBodyLeftGeo2 = new THREE.ExtrudeGeometry(
        new THREE.Shape()
          .moveTo(0, -10)
          .lineTo(0, 10)
          .lineTo(20, -3)
          .lineTo(0, -10),
        {
          depth: 0.1,
          bevelEnabled: false
        }
      )
      this.envBodyLeft1 = new THREE.Mesh(envBodyLeftGeo1, envMat)
      this.envBodyLeft1.position.set(-14.95, 0, 0.1)
      this.envBodyLeft2 = new THREE.Mesh(envBodyLeftGeo2, envMat)
      this.envBodyLeft2.position.set(-15, 0, 0.15)

      const envBodyRightGeo1 = new THREE.BoxGeometry(0.1, 20, 0.2)
      const envBodyRightGeo2 = new THREE.ExtrudeGeometry(
        new THREE.Shape()
          .moveTo(0, -10)
          .lineTo(0, 10)
          .lineTo(-20, -3)
          .lineTo(0, -10),
        {
          depth: 0.1,
          bevelEnabled: false
        }
      )
      this.envBodyRight1 = new THREE.Mesh(envBodyRightGeo1, envMat)
      this.envBodyRight1.position.set(14.95, 0, 0.15)
      this.envBodyRight2 = new THREE.Mesh(envBodyRightGeo2, envMat)
      this.envBodyRight2.position.set(14.95, 0, 0.25)

      const envBodyBottomGeo1 = new THREE.BoxGeometry(30, 0.1, 0.3)
      const envBodyBottomGeo2 = new THREE.ExtrudeGeometry(
        new THREE.Shape()
          .moveTo(15, -10)
          .lineTo(-15, -10)
          .lineTo(0, 3)
          .lineTo(15, -10),
        {
          depth: 0.1,
          bevelEnabled: false
        }
      )
      this.envBodyBottom1 = new THREE.Mesh(envBodyBottomGeo1, envMat)
      this.envBodyBottom1.position.set(0, -9.95, 0.2)
      this.envBodyBottom2 = new THREE.Mesh(envBodyBottomGeo2, envMat)
      this.envBodyBottom2.position.set(0, 0, 0.35)

      const envBodyTopGeo1 = new THREE.BoxGeometry(30, 0.5, 0.1)
      const envBodyTopGeo2 = new THREE.ExtrudeGeometry(
        new THREE.Shape()
          .moveTo(15, 0)
          .lineTo(-15, 0)
          .lineTo(0, 15)
          .lineTo(15, 0),
        {
          depth: 0.1,
          bevelEnabled: false
        }
      )
      this.envBodyTop1 = new THREE.Mesh(envBodyTopGeo1, envMat)
      this.envBodyTop1.position.set(0, 0.3, 0)
      this.envBodyTop2 = new THREE.Mesh(envBodyTopGeo2, envMat)
      this.envBodyTop2.position.set(0, 0.25, -0.05)

      this.rotateGroup = new THREE.Group()
      this.envBodyTop1.add(this.envBodyTop2)
      this.rotateGroup.add(this.envBodyTop1)
      this.rotateGroup.position.y = 9.95
      this.rotateGroup.rotation.x = 0.5 * Math.PI
      this.envBodyTop2.rotation.x = 0.5 * Math.PI

      const letterGeo = new THREE.BoxGeometry(28, 18, 0.1)
      this.letter = new THREE.Mesh(letterGeo, letterMat)
      this.letter.position.z = 0.1

      const stickerGeo = new THREE.CircleGeometry(3, 32)
      this.sticker = new THREE.Mesh(stickerGeo, stickerMat)
      this.sticker.position.set(0, 14, -0.01)
      this.sticker.rotation.z = 1 * Math.PI
      this.envBodyTop2.add(this.sticker)

      this.envelope.add(
        this.envBody,
        this.envBodyLeft1,
        this.envBodyLeft2,
        this.envBodyRight1,
        this.envBodyRight2,
        this.envBodyBottom1,
        this.envBodyBottom2,
        this.rotateGroup,
        this.letter,
      )

      this.envelope.rotation.y = -0.85 * Math.PI
    }
  }

  function createEnvelope() {
    envelopeObj = new Envelope()
    scene.add(envelopeObj.envelope)
  }

  function addText() {
    // 加入字體
    const loader = new THREE.FontLoader(loadingManager)
    loader.load(
      './src/font/FZLanTingHei-DB-GBK_Regular.json',
      function (font) {
        const envTextGeo = new THREE.TextGeometry(`Dear Mom`, {
          font: font,
          size: 3.2,
          height: 0.01,
          curveSegments: 12,
          bevelEnabled: false
        })
        const envTextMat = new THREE.MeshStandardMaterial({ color: 0x22cc77 })
        const envText = new THREE.Mesh(envTextGeo, envTextMat)
        envText.position.set(12, -1, -0.06)
        envText.rotation.y = 1 * Math.PI
        envelopeObj.envelope.add(envText)

        const letterTextGeo1 = new THREE.TextGeometry(
          `母 親 節 \n       快 樂`,
          {
            font: font,
            size: 1.6,
            height: 0.01,
            curveSegments: 12,
            bevelEnabled: false
          })
        const letterTextMat1 = new THREE.MeshStandardMaterial({ color: 0xcc2277 })
        const letterText1 = new THREE.Mesh(letterTextGeo1, letterTextMat1)
        letterText1.position.set(-11, 0, 0.05)
        letterText1.rotation.z = 0.2 * Math.PI
        envelopeObj.letter.add(letterText1)

        const letterTextGeo2 = new THREE.TextGeometry(
          `
          這 次 我 跟 姐 姐
          準 備 了 禮 物 給 你
          但 是 被 藏 起 來 囉
          要 自 己 去 找 哦 ～
          — 提 示 在 下 面 —
          `,
          {
            font: font,
            size: 1,
            height: 0.01,
            curveSegments: 12,
            bevelEnabled: false
          })
        const letterTextMat2 = new THREE.MeshStandardMaterial({ color: 0x5570ee })
        const letterText2 = new THREE.Mesh(letterTextGeo2, letterTextMat2)
        letterText2.position.set(-3, 7.5, 0.05)
        envelopeObj.letter.add(letterText2)

        const letterTextGeo3 = new THREE.TextGeometry(`跟 隨 木 觀 音 的 背 影 吧`, {
          font: font,
          size: 1.6,
          height: 0.01,
          curveSegments: 1,
          bevelEnabled: false
        })
        const letterTextMat3 = new THREE.MeshStandardMaterial({ color: 0xca6702 })
        const letterText3 = new THREE.Mesh(letterTextGeo3, letterTextMat3)
        letterText3.position.set(-12, -5.5, 0.05)
        envelopeObj.letter.add(letterText3)
      }
    )
  }

  createEnvelope()
  addText()

  directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(30, 20, 40)
  scene.add(directionalLight)

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

function onTransitionEnd(event) {
  const element = event.target;
  element.remove();
}

function envAnimation() {
  switch (animationStep) {
    case 'start':
      const loop1 = setInterval(() => {
        if (envelopeObj.envelope.rotation.y < 0) {
          envelopeObj.envelope.rotation.y += 0.05
          animationStep = 'open'
        } else {
          clearInterval(loop1)
        }
      }, 15)
      break
    case 'open':
      if (envelopeObj.envelope.rotation.y >= 0) {
        const loop2 = setInterval(() => {
          if (envelopeObj.rotateGroup.rotation.x > 0) {
            envelopeObj.rotateGroup.rotation.x -= 0.1
          } else if (envelopeObj.envBodyTop2.rotation.x > 0) {
            envelopeObj.envBodyTop2.rotation.x -= 0.1
          } else {
            clearInterval(loop2)
            animationStep = 'takeOutCard'
          }
        }, 30)
      }
      break
    case 'takeOutCard':
      const loop3 = setInterval(() => {
        if (envelopeObj.letter.position.y <= 100) {
          envelopeObj.letter.position.y += 1.5
          camera.position.y += 1.5
        } else {
          clearInterval(loop3)
          animationStep = 'end'
        }
      }, 30)
      break
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

window.addEventListener('touchend', () => {
  envAnimation()
})

window.addEventListener('click', () => {
  envAnimation()
})