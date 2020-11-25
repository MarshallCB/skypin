'use strict';

const resolveFrom = require('resolve-from');
const umap = require('umap');
const path = require('path');
const findUp = require('find-up');
let cache = umap();
