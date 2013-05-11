/*
 *
 *  Hi there, have a look at my source files here:
 *  https://github.com/stefanRitter/
 * 
 *
 */


// *********************************************************************************************************** APP
var App = new (Backbone.View.extend({
  firstLoad: true,

  Models: {},
  Views: {},
  Collections: {},

  router: {},

  moveClasses: ['moveBottomRight', 'moveBottomLeft', 'moveTopRight', 'moveTopRight'],
  delayClasses: ['delay1', 'delay2', 'delay3', 'delay4'],

  events: { 'click': function() {
    App.router.navigate('portfolio', {trigger: true});
  }},

  start: function() {
    // get project list from server
    this.projects.fetch({
      reset: true,
      success: function() {
        $('.loading').css('display', 'none');
        setTimeout(function() { $('.mainFooter').addClass('fadeIn'); }, 2400);
        Backbone.history.start({ pushState: true });
      },
      error: function(err){ console.log("ERROR: loading projects"); console.log(err);}
    });
  },

  removeDisplacement: function() {
    for (var i = 0, len = this.moveClasses.length; i < len; i++) {
      $('.' + this.moveClasses[i]).removeClass(this.moveClasses[i]);
    }
    $('.moveCenter').removeClass('moveCenter');

    // wait for end of anim then activate scrolling
    setTimeout(function() { $('body').css('overflow-y', 'auto'); }, 2300);
  }
}))({el: document.body});


// *********************************************************************************************************** MODELS
App.Models.Project = Backbone.Model.extend({});

App.Models.Projects = Backbone.Collection.extend({
  url: '../javascripts/projects.json',
  model: App.Models.Project
});
App.projects = new App.Models.Projects();


// *********************************************************************************************************** VIEWS
App.Views.Project = Backbone.View.extend({
  template: _.template( '<h2><%= title %></h2>' +
                        '<div class="gallery"><div class="currentImage"></div><div class="thumbnails"></div></div>' +

                        '<div class="description"><div class="textDesc">' +
                          '<%= description %></div>' +
                        '</div>' +

                        '<% if (link) { %>' +
                          '<div class="link"><a href="<%= link %>">more information</a>' +
                          '<% if (animation) { %> | <a href="<%= animation %>">view animation</a><% } %>' +
                          '</div>' +
                        '<% } %>'),

  events: { 'click': function(e) { e.stopPropagation(); }},

  images: [],

  initialize: function() {
    // render view when model is changed
    this.listenTo(this.model, 'change', this.render);

    // start loading all images from gallery array during transition
    var gallery = this.model.get('gallery');
    for (var i = 0, len = gallery.length; i < len; i++) {
      this.images[i] = new Image();
      this.images[i].src = '../' + gallery[i];
      this.images[i].onclick = this.switchImage;
    }
  },

  render: function() {

    if (this.model.get('id') == 'X') {
      // TODO: new project view
      // App.project = new App.Views.NewProjcet({el: this.el});
      // App.project.render();

    } else {

      var proj = $( this.template( this.model.toJSON() ));

      // stop propagation
      $(proj).not('h2').on('click', function(e) { e.stopPropagation(); });
      var children = proj.children();
      for(var i = 0, len = children.length; i < len; i++) {
        $(children[i]).on('click', function(e) { e.stopPropagation(); });
      }

      var tempImg = new Image();
      tempImg.src = this.images[0].src;
      proj.find('.currentImage').append(tempImg);

      for (var i = 0, len = this.images.length; i < len; i++) {
        proj.find('.thumbnails').append(this.images[i]);
      }

      setTimeout(function() {
        $('.project').empty().append(proj).removeClass('fadeOut').addClass('fadeIn');
        $('.project').css('visibility', 'visible');
      }, 2300);
    }

    // randomly move other projects off screen
    var otherProjects = this.$el.siblings();
    for (var i = 0, len = otherProjects.length; i < len; i++) {
      $(otherProjects[i]).addClass(App.delayClasses[Math.floor(Math.random()*4)]);
      $(otherProjects[i]).addClass(App.moveClasses[Math.floor(Math.random()*4)]);
    }

    // position this one for transition into project view
    var dX = window.innerWidth/2 - (this.$el.offset().left) - this.el.offsetWidth/2;
    var dY = window.innerHeight/2 - (this.$el.offset().top) - this.el.offsetHeight/2;

    $('#dynamicStyle').remove();

    var style = $('<style id="dynamicStyle">' +
                    '.moveCenter {' +
                    '-webkit-transform-origin: 50% 50% 50%;' +
                    '-moz-transform-origin: 50% 50% 50%;' +
                    '-ms-transform-origin: 50% 50% 50%;' +
                    '-o-transform-origin: 50% 50% 50%;' +
                    'transform-origin: 50% 50% 50%;' +
                    '-webkit-transform: translate('+dX+'px, '+dY+'px) scale(2.0);' +
                    '-moz-transform: translate('+dX+'px, '+dY+'px) scale(2.0);' +
                    '-ms-transform: translate('+dX+'px, '+dY+'px) scale(2.0);' +
                    '-o-transform: translate('+dX+'px, '+dY+'px) scale(2.0);' +
                    'transform: translate('+dX+'px, '+dY+'px) scale(2.0);' +
                  '}</style>' );

    $('html > head').append(style);
    this.$el.addClass('moveCenter');
    this.$el.find('.rotate-back').addClass('grayscale');
  },

  switchImage: function(e) {
    e.stopPropagation();
    var el = e.target || e.srcElement;

    var tempImg = new Image();
    tempImg.src = el.src;
    $('.currentImage').addClass('fadeOut');

    setTimeout( function() {
      $('.currentImage').empty().append(tempImg).removeClass('fadeOut').addClass('fadeIn');
    }, 500);
  },

  kill: function(callback) {
    $('.project').removeClass('slowFadeIn').addClass('fadeOut');
    setTimeout(function() {
      $('.project').css('visibility', 'hidden');
    }, 500);
    if (callback) { return callback(); }
  }
});


App.Views.ProjectTile = Backbone.View.extend({
  className: 'projectTile',

  template: _.template('<div class="rotate-crop">' +
                          '<div class="rotate-back">' +
                            '<img src="<%= titleImage %>" />' +
                          '</div>' +
                        '</div>'),

  events: { 'click': 'onClick', 'dblclick': 'onDblClick' },

  initialize: function() {
    // render view when model is changed
    this.listenTo(this.model, 'change', this.render);

    this.$el.addClass(App.delayClasses[Math.floor(Math.random()*4)]);
    this.$el.addClass(App.moveClasses[Math.floor(Math.random()*4)]);

    this.el.id = this.model.get('id');
  },

  render: function() {
    this.$el.html( this.template( this.model.toJSON() ) );

    var maxWidth = window.innerWidth - window.innerWidth/10,
        percentage = (window.innerWidth <= 800) ? 47 : 22.5;
    this.el.style.height = maxWidth/100 * percentage + 'px';

    return this; // method chaining
  },

  onClick: function(event) {
    event.preventDefault();
    event.stopPropagation();
    App.router.navigate('portfolio/' + this.model.get('id'), {trigger: true});
  }
});


App.Views.ProjectList = Backbone.View.extend({
  className: 'projectList',

  initialize: function() {
    this.listenTo(this.collection, 'add', this.renderOne);
    this.listenTo(this.collection, 'reset', this.render);
  },

  render: function() {
    this.$el.empty();
    this.renderAll();
    this.$el.append($('<div class="project"></div>'));
    $('#app').html(this.el);
  },

  renderAll: function() {
    this.collection.forEach(this.renderOne, this);
  },

  renderOne: function(project) {
    var tempView = new App.Views.ProjectTile({model: project});
    tempView.render();
    this.$el.append(tempView.el);
  }
});
App.projectList = new App.Views.ProjectList({collection: App.projects});


// *********************************************************************************************************** ROUTER
App.router = new (Backbone.Router.extend({

  routes: {
    "(/)": "index",
    "portfolio(/)": "index",
    "portfolio/:id(/)": "project"
  },

  index: function() {
    if (App.project) {

      App.project.kill( function() {
        App.project = null;
        App.removeDisplacement();
      } );

    } else if (!App.firstLoad) {
      // remove all displacement classes
      App.removeDisplacement();

    } else {
      // this is a first load, wait before zooming projects into view
      setTimeout( function() {
        App.removeDisplacement();
        App.firstLoad = false;
      }, 200);
    }
  },

  project: function(id) {
    var num = parseInt(id, 10);
    if ( id === 'X' || (num >= 0 && num <= App.projects.length-1)) {
      App.project = new App.Views.Project({model: App.projects.get(id), el: $('#'+id)});

      if (App.firstLoad) {
        // get project into view
        for (var i = 0, len = App.moveClasses.length; i < len; i++) {
          App.project.$el.removeClass(App.moveClasses[i]);
        }
      }

      App.project.render();

    } else {
      // not a valid id redirect to index
      App.router.navigate('/', {trigger: true});
    }
  }
}))();


// *********************************************************************************************************** READY
$(function() {
  App.start();
});
