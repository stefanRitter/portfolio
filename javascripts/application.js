//(function() {


  // *********************************************************************************************************** MODELS
  var ProjectModel = Backbone.Model.extend({});

  var ProjectsCollection = Backbone.Collection.extend({
    url: 'javascripts/projects.js',
    model: ProjectModel
  });
  var projects = new ProjectsCollection();

  // for testing
  var testProject = new ProjectModel({ id: 1, title: 'test project' });
  var testView = new ProjectView({ model: testProject });


  // *********************************************************************************************************** VIEWS
  var ProjectView = Backbone.View.extend({
    template: _.template('<h2><%= title %></h2>'),

    events: { 'dblclick': 'onClick' },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
    },

    initialize: function() {
      // render view when model is changed
      this.model.on('change', this.render, this);
    },

    onClick: function() {
      alert('you double clicked on a project');
    }
  });


  var projectListView = new (Backbone.View.extend({
    collection: projects,

    initialize: function() {
      this.collection.on('add', this.renderOne, this);
      this.collection.on('reset', this.renderAll, this);
    },

    render: function() {
      $('#app').html(this.el);
    },

    renderAll: function() {
      this.collection.forEach(this.renderOne, this);
    },

    renderOne: function(project) {
      var tempView = new ProjectView({model: project});
      tempView.render();
      this.$el.append(tempView.el);
    }
  }))();

  projects.fetch({
    reset: true,
    success: function(){ /*console.log(projects.toJSON());*/ },
    error: function(){ console.log("ERROR: loading projects"); }
  });


  // *********************************************************************************************************** ROUTER
  var appRouter = new (Backbone.Router.extend({
    start: function() {
      Backbone.history.start({ pushState: true });
    }
  }))();


  // *********************************************************************************************************** READY
  $(function($) {

  });
//}).call(this);