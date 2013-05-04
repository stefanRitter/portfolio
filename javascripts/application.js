(function() {

  var ProjectModel = Backbone.Model.extend({});

  var ProjectView = Backbone.View.extend({
    render: function() {
      var html = '<h1>' + this.model.get('title') + '</h1>';
      $(this.el).html(html);
    }
  });

  var Projects = Backbone.Collection.extend({});

  // for later
  var appRouter = new (Backbone.Router.extend({
    start: function() {
      Backbone.history.start({ pushState: true });
    }
  }))();

  // testing
  var proj = new ProjectModel({ id: 1, title: 'first project' });
  var testView = new ProjectView({ model: proj });
  testView.render();

  // document ready
  $(function($) {

    $('#app').html(testView.el);

  });
}).call(this);