(function() {
  var ProjectModel = Backbone.Model.extend({});

  var ProjectsCollection = Backbone.Collection.extend({
    url: 'javascripts/projects.js',
    model: ProjectModel
  });

  var projects = new ProjectsCollection();
  projects.fetch({ 
    success: function(){ console.log(projects.toJSON()); }, 
    error: function(){ console.log("ERROR: loading projects"); } 
  });



  var ProjectView = Backbone.View.extend({
    template: _.template('<h2><%= title %></h2>'),

    events: { 'dblclick': 'onClick' },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
    },

    intitialize: function() {
      // render view when model is changed
      this.model.on('change', this.render, this);
    },

    onClick: function() {
      alert('you double clicked on a project');
    }
  });

  var ProjectListView = Backbone.View.extend({
    render: function() {
      this.collection.forEach(this.renderOne, this);
    },

    renderOne: function(project) {
      var tempView = new ProjectView({model: project});
      tempView.render();
      this.$el.append(tempView.el);
    }
  });
  var projectListView = new ProjectListView({
    collection: projects
  });

  

  // for later
  var appRouter = new (Backbone.Router.extend({
    start: function() {
      Backbone.history.start({ pushState: true });
    }
  }))();

  // for testing
  var testProject = new ProjectModel({ id: 1, title: 'test project' });
  var testView = new ProjectView({ model: testProject });
  testView.render();

  // document ready
  $(function($) {

    projectListView.render();
    $('#app').html(projectListView.el);

  });
}).call(this);