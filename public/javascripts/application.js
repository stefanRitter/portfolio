/*
 *
 *  Hi there, have a look at my source files here:
 *  https://github.com/stefanRitter/
 * 
 *
 */


// *********************************************************************************************************** APP
var App = new (Backbone.View.extend({

  Models: {},
  Views: {},
  Collections: {},

  router: {},

  moveClasses: ['moveBottomRight', 'moveBottomLeft', 'moveTopRight', 'moveTopRight'],
  delayClasses: ['delay1', 'delay2', 'delay3', 'delay4'],

  events: { 'keyup': function() {
    App.router.navigate('portfolio', {trigger: true});
  }},

  start: function() {
    // get project list from server
    this.projects.fetch({
      reset: true,
      success: function() {
        App.projects.trigger('init');
        Backbone.history.start({ pushState: true });

        setTimeout( function() {
          App.router.navigate('portfolio', {trigger: true});
        }, 200);
      },
      error: function(err){ console.log("ERROR: loading projects"); console.log(err);}
    });
  },

  removeDisplacement: function() {
    for (var i = 0, len = this.moveClasses.length; i < len; i++) {
      $('.' + this.moveClasses[i]).removeClass(this.moveClasses[i]);
    }
    $('.moveCenter').removeClass('moveCenter');
  }
}))({el: document.body});


// *********************************************************************************************************** MODELS
App.Models.Project = Backbone.Model.extend({});

App.Models.Projects = Backbone.Collection.extend({
  url: 'javascripts/projects.json',
  model: App.Models.Project
});
App.projects = new App.Models.Projects();


// *********************************************************************************************************** VIEWS
App.Views.Project = Backbone.View.extend({
  template: _.template('<div class="project">' +
                          '<h2><%= title %></h2>' +
                          '<div class="gallery"><%= description %></div>' +
                          '<div class="description"><%= description %></div>' +
                          '<% if (link) { %>' +
                          '<div class="link"><a href="<%= link %>">more information</a></div>' +
                          '<% } %>' +
                        '</div>'),

  events: {},

  images: [],

  initialize: function() {
    // render view when model is changed
    this.listenTo(this.model, 'change', this.render);

    // start loading all images from gallery array during transition
    for (var i = 0, len = this.model.get('gallery').length; i < len; i++) {
      this.images[i] = new Image();
      this.images[i].src = this.model.gallery[i];
    }
  },

  render: function() {
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

    if (this.model.get('id') == 'X') {
      // TODO: new project view
      // App.project = new App.Views.NewProjcet({el: this.el});
      // App.project.render();
    } else {
      var html = this.template( this.model.toJSON() );
      this.$el.parent().append($(html));
    }
  },

  kill: function(callback) {
    $('.project').remove();

    if (callback) {
      return callback();
    }
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

    var maxWidth = window.innerWidth - window.innerWidth/10;
    this.el.style.height = maxWidth/100 * 22.5 + 'px';

    this.$el.addClass(App.delayClasses[Math.floor(Math.random()*4)]);
    this.$el.addClass(App.moveClasses[Math.floor(Math.random()*4)]);

    this.el.id = this.model.get('id');
  },

  render: function() {
    this.$el.html( this.template( this.model.toJSON() ) );
    return this; // method chaining
  },

  onClick: function(event) {
    event.preventDefault();
    App.router.navigate('portfolio/' + this.model.get('id'), {trigger: true});
  }
});


App.Views.ProjectList = Backbone.View.extend({
  className: 'projectList',

  initialize: function() {
    this.listenTo(this.collection, 'add', this.renderOne);
    this.listenTo(this.collection, 'reset', this.renderAll);
    this.listenTo(this.collection, 'init', this.render);
  },

  render: function() {
    this.$el.empty();
    this.renderAll();
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
    "portfolio(/)": "index",
    "portfolio/:id(/)": "project"
  },

  index: function() {
    if (App.project) {
      App.project.kill( function() { App.removeDisplacement(); } );
    } else {
      // remove all displacement classes
      App.removeDisplacement();
    }
  },

  project: function(id) {
    App.project = new App.Views.Project({model: App.projects.get(id), el: $('#'+id)});
    App.project.render();
  }
}))();


// *********************************************************************************************************** READY
$(function() {
  App.start();
});
