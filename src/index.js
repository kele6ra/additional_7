SudokuSolver = function(sudoku) {
    var progressMatrix = [];
    initSolved(sudoku);

    function initSolved(sudoku) {
        var possibles = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for ( var i=0; i<9; i++) {
            progressMatrix[i] = [];
            for ( var j=0; j<9; j++ ) {
                if ( sudoku[i][j] ) progressMatrix[i][j] = [sudoku[i][j], []];
                else progressMatrix[i][j] = [0, possibles];
            }
        }
        solver();
    };

    function solver() {
        var steps = 0, changed = 0;
        do {
            changed = decreasePossibles();
            steps++;
            if ( 81 < steps ) break;
        } while (changed);

        if ( !isSolved() ) recurseSolve();
    };

    function decreasePossibles() {
        var changed = 0, buf = arrayDiff(progressMatrix[1][3][1], rowValues(1));
        buf = arrayDiff(buf, colValues(3));
        buf = arrayDiff(buf, areaValues(1, 3));
        for ( var i=0; i<9; i++) {
            for ( var j=0; j<9; j++) {
                if ( progressMatrix[i][j][0] != 0 ) continue;
                changed += solveSingle(i, j);
                changed += solveHiddenSingle(i, j);
            }
        }
        return changed;
    }; 

    function solveSingle(i, j) {
        progressMatrix[i][j][1] = arrayDiff(progressMatrix[i][j][1], rowValues(i));
        progressMatrix[i][j][1] = arrayDiff(progressMatrix[i][j][1], colValues(j));
        progressMatrix[i][j][1] = arrayDiff(progressMatrix[i][j][1], areaValues(i, j));
        if ( progressMatrix[i][j][1].length == 1) {
            progressMatrix[i][j][0] = progressMatrix[i][j][1][0];
            return 1;
        }
        return 0;
    }; 

    function solveHiddenSingle(i, j) {
        var less_possibles = lessRowPossibles(i, j);
        var changed = 0;
        if ( less_possibles.length == 1 ) {
            progressMatrix[i][j][0] = less_possibles[0];
            changed++;
        }
        var less_possibles = lessColPossibles(i, j);
        if ( less_possibles.length == 1 ) {
            progressMatrix[i][j][0] = less_possibles[0];
            changed++;
        }
        var less_possibles = lessAreaPossibles(i, j);
        if ( less_possibles.length == 1 ) {
            progressMatrix[i][j][0] = less_possibles[0];
            changed++;
        }
        return changed;
    };     
    
    function rowValues(i) {
        var content = [];
        for ( var j=0; j<9; j++ ) {
            if ( progressMatrix[i][j][0] != 0 ) content[content.length] = progressMatrix[i][j][0];
        }
        return content;
    }; 

    function colValues(j) {
        var content = [];
        for ( var i=0; i<9; i++ ) {
            if ( progressMatrix[i][j][0] != 0 ) content[content.length] = progressMatrix[i][j][0];
        }
        return content;
    };

    function areaValues(i, j) {
        var content = [];
        var offset = areaOffset(i, j);
        for ( var k=0; k<3; k++ ) {
            for ( var l=0; l<3; l++ ) {
                if ( progressMatrix[offset.i+k][offset.j+l][0] != 0 ) {
                    content[content.length] = progressMatrix[offset.i+k][offset.j+l][0];
                }
            }
        }
        return content;
    }; 

    function lessRowPossibles(i, j) {
        var less_possibles = progressMatrix[i][j][1];
        for ( var k=0; k<9; k++ ) {
            if ( k == j || progressMatrix[i][k][0] != 0 ) continue;
            less_possibles = arrayDiff(less_possibles, progressMatrix[i][k][1]);
        }
        return less_possibles;
    }; 

    function lessColPossibles(i, j) {
        var less_possibles = progressMatrix[i][j][1];
        for ( var k=0; k<9; k++ ) {
            if ( k == i || progressMatrix[k][j][0] != 0 ) continue;
            less_possibles = arrayDiff(less_possibles, progressMatrix[k][j][1]);
        }
        return less_possibles;
    }; 

    function lessAreaPossibles(i, j) {
        var less_possibles = progressMatrix[i][j][1];
        var offset = areaOffset(i, j);
        for ( var k=0; k<3; k++ ) {
            for ( var l=0; l<3; l++ ) {
                if ( ((offset.i+k) == i  && (offset.j+l) == j)|| progressMatrix[offset.i+k][offset.j+l][0] != 0 ) continue;
                less_possibles = arrayDiff(less_possibles, progressMatrix[offset.i+k][offset.j+l][1]);
            }
        }
        return less_possibles;
    };

    function arrayDiff (ar1, ar2) {
        var arr_diff = [];
        for ( var i=0; i<ar1.length; i++ ) {
            var is_found = false;
            for ( var j=0; j<ar2.length; j++ ) {
                if ( ar1[i] == ar2[j] ) {
                    is_found = true;
                    break;
                }
            }
            if ( !is_found ) arr_diff[arr_diff.length] = ar1[i];
        }
        return arr_diff;
    };

    function arrayUnique(ar){
        var sorter = {};
        for(var i=0,j=ar.length;i<j;i++){
            sorter[ar[i]] = ar[i];
        }
        ar = [];
        for(var i in sorter){
            ar.push(i);
        }
        return ar;
    }; 
    
    function areaOffset(i, j) {
        return {
            j: Math.floor(j/3)*3,
            i: Math.floor(i/3)*3
        };
    }; 

    this.isSolved = function() {
        return isSolved();
    }; 

    function isSolved() {
        var is_solved = true;
        for ( var i=0; i<9; i++) {
            for ( var j=0; j<9; j++ ) {
                if ( progressMatrix[i][j][0] == 0 ) is_solved = false;
            }
        }
        return is_solved;
    };

    function recurseSolve() {
        var sudokuIn = [[], [], [], [], [], [], [], [], []], sudokuOut = [[], [], [], [], [], [], [], [], []];
        var i_min=-1, j_min=-1, suggests_cnt=0;
        for ( var i=0; i<9; i++ ) {
            sudokuIn[i].length = 9;
            for ( var j=0; j<9; j++ ) {
                sudokuIn[i][j] = progressMatrix[i][j][0];
                if ( progressMatrix[i][j][0] == 0 && (progressMatrix[i][j][1].length < suggests_cnt || !suggests_cnt) ) {
                    suggests_cnt = progressMatrix[i][j][1].length;
                    i_min = i;
                    j_min = j;
                }
            }
        }

        for ( var k=0; k<suggests_cnt; k++ ) {
            sudokuIn[i_min][j_min] = progressMatrix[i_min][j_min][1][k];
            var sudoku = new SudokuSolver(sudokuIn);
            if ( sudoku.isSolved() ) {
                sudokuOut = sudoku.solved();
                for ( var i=0; i<9; i++ ) {
                    for ( var j=0; j<9; j++ ) {
                        if ( progressMatrix[i][j][0] == 0 ) progressMatrix[i][j][0] = sudokuOut[i][j];
                    }
                }
                return;
            }
        }
    }; 

	this.solved = function() {
        var solvedSudoku = [];
        for (let i=0;i<9;i++){
            solvedSudoku[i] = [];
            for (let j=0;j<9;j++){
               solvedSudoku[i].push(progressMatrix[i][j][0]);
            }
        }
        return solvedSudoku;
    }; 
};

module.exports = function solveSudoku(matrix) {
	var sudoku = new SudokuSolver(matrix);
	return(sudoku.solved());
 }