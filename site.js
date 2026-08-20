// copy buttons for command blocks — no dependencies, injected so shells stay clean
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('pre.install').forEach(function (pre) {
    var text = pre.innerText.trim(); // capture BEFORE the button joins the element
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'copy';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = '✓ copied';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'copy'; btn.classList.remove('done'); }, 1400);
      });
    });
    pre.appendChild(btn);
  });
});
