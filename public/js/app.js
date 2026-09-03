document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sidebarToggle');
  var overlay = document.getElementById('sidebarOverlay');

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  }

  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('show');
      if (overlay) overlay.classList.toggle('show');
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.alert-dismissible').forEach(function (alert) {
    setTimeout(function () {
      try {
        var bs = bootstrap.Alert.getOrCreateInstance(alert);
        if (bs) bs.close();
      } catch (e) {}
    }, 5000);
  });
});
