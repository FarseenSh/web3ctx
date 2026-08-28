// coverage filter — no dependencies, no build step, and it degrades to a full table with JS off
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('cov-filter');
  var count = document.getElementById('cov-count');
  var rows = [].slice.call(document.querySelectorAll('#cov-table tbody tr'));
  if (input === null || rows.length === 0) return;
  // Pre-computed once: filtering 630 rows on every keystroke by reading innerText is ~10x slower
  // and visibly janky on a phone.
  var haystacks = rows.map(function (r) { return r.getAttribute('data-q') || r.innerText.toLowerCase(); });
  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    for (var i = 0; i < rows.length; i++) {
      var hit = q === '' || haystacks[i].indexOf(q) !== -1;
      rows[i].style.display = hit ? '' : 'none';
      if (hit) shown++;
    }
    count.textContent = q === ''
      ? rows.length + ' projects'
      : shown + ' of ' + rows.length + ' projects';
  }
  input.addEventListener('input', apply);
  apply();
});
