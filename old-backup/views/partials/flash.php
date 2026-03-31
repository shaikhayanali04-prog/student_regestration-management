<?php $flashMessage = flash('global'); ?>
<?php if ($flashMessage): ?>
    <div class="alert alert-<?= e($flashMessage['type']) ?> shadow-sm border-0 mb-4">
        <?= e($flashMessage['message']) ?>
    </div>
<?php endif; ?>
