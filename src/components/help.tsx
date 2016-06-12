
import * as React from 'react';

const text = (
    <div>
        <h2>Решение задачи линейного программирования. Симплекс метод</h2>
        <div>
            <h4>Ввод данных:</h4>
            <ul>
                <li>Сначала вводится число коэффициентов полинома(включая свободный член) и число граничных условий.</li>
                <li>Затем вводятся коэффициенты полинома и граничных условий.</li>
                <li>Коэффициенты могут быть целочисленными либо рациональными.</li>
                <li>Пример ввода рационального числа: "-1/2" (без ковычек).</li>
                <li>После того как все данные были введены, можно начать вычисления кнопкой <button>calc</button>.</li>
                <li>После нажатия на кнопку <button>calc</button>, введенные данные сохраняются в браузере и восстанавливаются после обновления страницы.</li>
                <li>Для очистки решения нужно перезагрузить страницу <button onClick={() => location.reload()}>↺</button></li>
            </ul>
            <h4>Выбор опорного элемента:</h4>
            <ul>
                <li>Выбор опорного элемента осуществляется кликом по нужному значению в матрице.</li>
                <li>Для автоматического выбора опорного элемента, нужно нажать <button>next</button>.</li>
                <li><button>back</button> возвращает на предыдущий шаг.</li>
            </ul>
            <h3>Сохранение в файл и загрузка из файла.</h3>
            <span>Введенные данные сохраняются по нажатию на кнопку<button>download</button>.</span><br/>
            <span>Для загрузки данных нужно нажать на <button>Выберите файл</button> и выбрать нужный файл.</span>
        </div>
    </div>
);

export default class Help extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {
            show: false
        }
    }

    onClick() {
        this.setState({show: !this.state.show});
    }

    render() {
        return (
            <div>
                <a onClick={this.onClick} href="#">{this.state.show ? '-' : '+'} help</a>
                {this.state.show ?
                    <div>{text}</div>: null}
                <br/><br/>
            </div>
        )
    }
}