'use strict';

var app = app || {};

(function(module) {
  let heroView = {};

  heroView.appendHeroView = () => {
    app.Hero.all.forEach((hero, i) => {
      hero.arrayIndex = i;
      hero.star_rating = 0;  //default setting to make sort work correctly
      $('#hero-view-list').append(hero.toHtml());
      heroView.setUserHeroRating(hero);
    })
  }


  heroView.setUserHeroRating = (hero_data) => {
    let rating_prop = hero_data.name.replace(/\s/g, '_').toLowerCase()
    if (!localStorage.ratings) return;
    let hero_ratings = JSON.parse(localStorage.ratings)[rating_prop] || 0;
    if (!hero_ratings) return;
    let hero_tile = $(`li[data-hero-id="${hero_data.hero_id}"]`);
    hero_tile.find('.icon-star-empty').eq(hero_ratings - 1).click();
    app.Hero.all[hero_data.arrayIndex].star_rating = hero_ratings;
  }

  //helper function to set pushState
  heroView.setURl = (data, url, callback) => {
    if (window.location.pathname === url) return;
    history.pushState( {
      data: data,
      callback: callback
    }, null, url);
  }

  heroView.initIndexPage = () => {
    $('.container').hide();
    $('#hero-view').show();

    //check local storage for heros array
    let localHeroes = localStorage.heroes ? JSON.parse(localStorage.heroes) : [];
    //compare local storage etag to dtatbase etag and check length of heors array
    //if the etag is no mising and matches the database etag, and the hero array is not empty,
    //then load from local storage, otherwise fetch the data from the database
    if (localStorage.etag === app.etag && localHeroes.length) return heroView.setAll(localHeroes);
    $.get('/heroes')
      .then(data => {
        heroView.setAll(data);
        localStorage.heroes = JSON.stringify(data);
        localStorage.etag = app.etag;
      })
      .catch(console.error);
  };

  heroView.setAll = (heroData) => {
    heroData.sort((a,b) => a.name < b.name ? -1 : 1 );
    app.Hero.all = heroData.map(hero => new app.Hero(hero))
    heroView.appendHeroView();
  }

  $('#hero-view-list').on('click', '.user-hero-rating span', setStarClass)

 
  function setStarClass() {
    if ($(this).hasClass('icon-star-empty')){
      $(this).removeClass('icon-star-empty').addClass('icon-star-full');
      $(this).prevAll().removeClass('icon-star-empty').addClass('icon-star-full')
    } else {
      if ($(this).next('.icon-star-empty').length) $(this).removeClass('icon-star-full').addClass('icon-star-empty');
    }
    $(this).nextAll().removeClass('icon-star-full').addClass('icon-star-empty')
    setRatingsStorage(this)
  }
  
  function setRatingsStorage(clicked_span){
    let starRating = $(clicked_span).parent().find('.icon-star-full').length;
    let current_hero_index = $(clicked_span).parents('li').attr('data-hero-index')
    let current_hero = app.Hero.all[current_hero_index];
    let hero_name_prop = current_hero.name.replace(/\s/g, '_').toLowerCase();
    let user_hero_ratings = localStorage.ratings ? JSON.parse(localStorage.ratings) : {};
    user_hero_ratings[hero_name_prop] = starRating;
    localStorage.ratings = JSON.stringify(user_hero_ratings);
    app.Hero.all[current_hero_index].star_rating = starRating;
  }

  

  module.heroView = heroView

  ///*****  event handlers ********///

  /************** filter change event ********************/
  $('#sort-form').on('change', function() {
    let eVal = $('#sort-menu').val()
    app.Hero.all.sort((a,b) => a[eVal] < b[eVal] ? -1 : 1 );
    if ($('#asc-menu').val() === 'desc') app.Hero.all.reverse();
    $('#hero-view-list').empty();
    app.heroView.appendHeroView();
  })

  /************** hero tile click event ********************/
  //$('#hero-view-list').on('click', 'li', function() {
  $('#hero-view-list').on('click', 'img', function() {
    let idx = $(this).parents('li').attr('data-hero-index');
    let hero = app.Hero.all[idx];
    let statURL = `/heroes-stat/${hero.name.split(' ').join('-')}`;
    app.heroView.setURl(idx , statURL, 'initStatsPage');
    app.stats.initStatsPage(hero);
  } )

  /************** custon select click event ********************/
  $('.custom-select').on('click', 'li, input', function() {
    if ($(this).attr('data-value')) {
      $(this).parent().siblings('input[type="text"]').val($(this).text())
      $(this).parent().siblings('input[type="hidden"]').val($(this).attr('data-value')).change();
      $(this).closest('form').change();
    }
    $(this).closest('.custom-select').toggleClass('z-index-nine');
    $(this).closest('.custom-select').find('.custom-select-menu').slideToggle()

  })

  /*********** History popstate event  ***********/
  window.onpopstate = function (event){
    if ( !event.state ) return app.initFunctions['homeNavItem']();
    let fn = event.state.callback
    let fargs = (fn === 'initStatsPage') ? app.Hero.all[event.state.data] : event.state.data;
    app.initFunctions[fn](fargs);
  }

})(app);


//on page load
$(function() {

  //set initial pushState
  app.heroView.setURl('', '/', 'homeNavItem' )

  //fetch  etag from data base then init index page
  $.get('/etags').then(etag => {
    app.etag = etag
    app.heroView.initIndexPage()
  });

})
