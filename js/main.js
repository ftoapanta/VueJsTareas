var config = {
  apiKey: "AIzaSyCffH01ClElRZMvXo5EcZxlULodWGPuWLg",
  authDomain: "tareasft-10d6a.firebaseapp.com",
  databaseURL: "https://tareasft-10d6a.firebaseio.com",
  projectId: "tareasft-10d6a",
  storageBucket: "tareasft-10d6a.appspot.com",
  messagingSenderId: "408006969067"
};
firebase.initializeApp(config);

var db = firebase.database(),
    auth = firebase.auth(),
    proveedor = new firebase.auth.GoogleAuthProvider();

Vue.component('todo-list', {
    template: '#todo-template',
    data: function () {
        return {
            nuevaTarea: null,
            editandoTarea: null,
        }
    },
    props: ['tareas', 'autentificado', 'usuarioActivo'],
    methods: {
        agregarTarea: function (tarea) {
            db.ref('tareas/').push({
                titulo: tarea,
                completado: false,
                nombre: vm.usuarioActivo.displayName,
                avatar: vm.usuarioActivo.photoURL,
                uid: vm.usuarioActivo.uid,
            });
            this.nuevaTarea = '';
        },
        editarTarea: function (tarea) {
            db.ref('tareas/' + tarea['.key']).update({
                titulo: tarea.titulo
            });
        },
        actualizarEstadoTarea: function (estado, tarea) {
            db.ref('tareas/' + tarea['.key']).update({
                completado: estado ? true : false,
            });
        },
        eliminarTarea: function (tarea) {
            db.ref('tareas/' + tarea['.key']).remove();
        },
    }
});

var vm = new Vue({
    el: 'body',
    ready: function () {
        // RT database
        db.ref('tareas/').on('value', function (snapshot) {
            vm.tareas = [];
            var objeto = snapshot.val();
            for (var propiedad in objeto) {
                vm.tareas.unshift({
                    '.key': propiedad,
                    completado: objeto[propiedad].completado,
                    titulo: objeto[propiedad].titulo,
                    avatar: objeto[propiedad].avatar,
                    nombre: objeto[propiedad].nombre,
                    uid: objeto[propiedad].uid,
                });
            }
        });

        // Auth
        auth.onAuthStateChanged(function (user) {
            if (user) {
                console.info('Conectado: ', user);
                vm.autentificado = true;
                vm.usuarioActivo = user;
            } else {
                console.warn('No conectado');
                vm.autentificado = false;
                vm.usuarioActivo = null;
            }
        });
    },
    data: {
        autentificado: false,
        usuarioActivo: null,
        tareas: [],
    },
    methods: {
        conectar: function () {
            firebase.auth().signInWithPopup(proveedor).catch(function (error) {
                console.error('Error haciendo logIn: ', error);
            });
        },
        desconectar: function () {
            firebase.auth().signOut().catch(function (error) {
                console.error('Error haciendo logOut: ', error);
            });
        }
    }
});