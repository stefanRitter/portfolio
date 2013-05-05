//(function() {

  // *********************************************************************************************************** MODELS
  var ProjectModel = Backbone.Model.extend({});

  var ProjectsCollection = Backbone.Collection.extend({
    url: 'javascripts/projects.js',
    model: ProjectModel
  });
  var projects = new ProjectsCollection();


  // *********************************************************************************************************** VIEWS
  var ProjectView = Backbone.View.extend({
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


  var ProjectListView = Backbone.View.extend({

    initialize: function() {
      this.listenTo(this.collection, 'add', this.renderOne);
      this.listenTo(this.collection, 'reset', this.renderAll);
      this.listenTo(this.collection, 'init', this.render);
      /*this.collection.on('add', this.renderOne, this);
      this.collection.on('reset', this.renderAll, this);
      this.collection.on('init', this.render, this);*/
    },

    render: function() {
      this.$el.empty();
      this.renderAll();
    },

    renderAll: function() {
      this.collection.forEach(this.renderOne, this);
    },

    renderOne: function(project) {
      var tempView = new ProjectView({model: project});
      tempView.render();
      this.$el.append(tempView.el);
    }
  });
  var projectListView = new ProjectListView({collection: projects, el: $('#app')});


  // *********************************************************************************************************** ROUTER
  var portfolioApp = new (Backbone.Router.extend({

    initialize: function() {
      // get project list from server
      projects.fetch({
        reset: true,
        success: function(){ projects.trigger('init'); },
        error: function(){ console.log("ERROR: loading projects"); }
      });
    },

    routes: {
      "portfolio": "index",
      "portfolio/:id": "project"
    },

    index: function() {
      projectListView.render();
    },

    project: function(id) {
      alert('you requested project: ' + id);
    },

    start: function() {
      Backbone.history.start({ pushState: true });
    }
  }))();


  // *********************************************************************************************************** READY
  // for testing
  var testProject = new ProjectModel({ id: 1, title: 'test project' });
  var testView = new ProjectView({ model: testProject });

  $(function($) {
    portfolioApp.start();
  });
//}).call(this);