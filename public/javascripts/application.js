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
    portfolioApp.navigate('portfolio/' + this.model.get('id'), {trigger: true});
  }
});


App.Views.ProjectList = Backbone.View.extend({

  initialize: function() {
    this.listenTo(this.collection, 'add', this.renderOne);
    this.listenTo(this.collection, 'reset', this.renderAll);
    this.listenTo(this.collection, 'init', this.render);
  },

  render: function() {
    this.$el.empty();
    this.renderAll();
  },

  renderAll: function() {
    this.collection.forEach(this.renderOne, this);
  },

  renderOne: function(project) {
    var tempView = new App.Views.Project({model: project});
    tempView.render();
    this.$el.append(tempView.el);
  }
});
App.projectList = new App.Views.ProjectList({collection: App.projects, el: $('#app')});


// *********************************************************************************************************** ROUTER
App.router = new (Backbone.Router.extend({

  routes: {
    "portfolio": "index",
    "portfolio/:id": "project"
  },

  index: function() {
    App.projectList.render();
  },

  project: function(id) {
    alert('you requested project: ' + id);
  }
}))();


// *********************************************************************************************************** READY
// for testing
//var testProject = new ProjectModel({ id: 1, title: 'test project' });
//var testView = new ProjectView({ model: testProject });

$(function() {
  App.start();
});
