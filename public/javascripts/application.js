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

  start: function() {
    // get project list from server
    this.projects.fetch({
      reset: true,
      success: function(){ App.projects.trigger('init'); },
      error: function(){ console.log("ERROR: loading projects"); }
    });

    Backbone.history.start({ pushState: true });
  }
}))({el: document.body});



// *********************************************************************************************************** MODELS
App.Models.Project = Backbone.Model.extend({});

App.Models.Projects = Backbone.Collection.extend({
  url: 'javascripts/projects.js',
  model: App.Models.Project
});
App.projects = new App.Models.Projects();


// *********************************************************************************************************** VIEWS
App.Views.Project = Backbone.View.extend({
  template: _.template('<h2><%= title %></h2>'),

  events: { 'dblclick': 'onClick' },

  render: function() {
    this.$el.html( this.template( this.model.toJSON() ) );
    return this; // method chaining
  },

  initialize: function() {
    // render view when model is changed
    this.model.on('change', this.render, this);
  },

  onClick: function() {
    App.router.navigate('/' + this.model.get('id'), {trigger: true});
  }
});


App.Views.ProjectTile = Backbone.View.extend({
  className: 'projectTile',

  template: _.template('<div class="rotate-crop">' +
                          '<div class="rotate-back">' +
                            '<img src="<%= titleImage %>" />' +
                          '</div>' +
                        '</div>'),

  events: { 'click': 'onClick' },

  render: function() {
    this.$el.html( this.template( this.model.toJSON() ) );
    return this; // method chaining
  },

  initialize: function() {
    // render view when model is changed
    this.model.on('change', this.render, this);
  },

  onClick: function(event) {
    event.preventDefault();
    this.$el.toggleClass('move');
    App.router.navigate(this.model.get('id'), {trigger: true});
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
    "": "index",
    "/:id": "project"
  },

  index: function() {
    App.projectList.render();
  },

  project: function(id) {
    alert('you requested project: ' + id);
  }
}))();


// *********************************************************************************************************** READY
$(function() {
  App.start();
});
