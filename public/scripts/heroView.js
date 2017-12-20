var app = app || {};

(function(module) {
  let heroView = {};
  function appendHeroView() {

    app.Hero.all.forEach((hero, i) => {
      hero.arrayIndex = i
      $('#hero-view-list').append(hero.toHtml())
    })


  }

  heroView.setURl = (view, url) => {
    history.pushState( {
      view: view,
    }, null, url);
  }

  heroView.initIndexPage = () => {
    heroView.setURl('home', '/')
    let heroData;
    if (localStorage.heroes) {
      console.log('inside if')
      setAll(JSON.parse(localStorage.heroes))

    } else {
      $.get('/heroes')
      // .then(data => )
        .then(data => {
          setAll(data)
          localStorage.heroes = JSON.stringify(data)})
        // .then(appendHeroView)
        .catch(console.error)
    }
  }

  function setAll (heroData) {
    heroData.sort((a,b) => a.name < b.name ? -1 : 1 );
    app.Hero.all = heroData.map(hero => new app.Hero(hero))
    appendHeroView();
  }


  module.heroView = heroView
})(app);

$(function() {
  app.heroView.initIndexPage()
  $('#hero-view').on('click', 'li', function() {
    app.stats.initStatsPage(this);
  } )
})

// heroView.initIndexPage = () => {
//   let heroData;
//   if (localStorage.heroes) {
//     console.log('inside if')
//     setAll(JSON.parse(localStorage.heroes))

//   } else {
//     $.get('/heroes')
//     // .then(data => )
//       .then(data => {
//         setAll(data)
//         localStorage.heroes = JSON.stringify(data)})
//       // .then(appendHeroView)
//       .catch(console.error)
//   }
// }
