/**
 * @component  Login
 * 登录组件
 * */
import React from "react";
import {connect} from "react-redux";
import Api from "~/until/api";
import {Form, Icon, Input, Button, Row} from "antd";
import * as message from '~/components/common/message';
const FormItem = Form.Item;

class Register extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            imgSrc: "",
            confirmDirty: false,
            issend: true,
            seconds: 60,
            tipTxt: "点击获取验证码",
            isclo: false,
            registWay: ""
        };
        this.registType = "";
    }

    componentWillMount() {
        this.getLoginCaptcha();
        this.setState({
            registWay: this.props.loginAllocation.registWay
        });
        const registWay = this.props.loginAllocation.registWay;
        let registWayArray = registWay.split("_");
        if (registWayArray.indexOf("account") >= 0) {
            this.registType = "用户名";
        }
        if (registWayArray.indexOf("phone") >= 0) {
            this.registType = this.registType + "/电话号码";
        }
        if (registWayArray.indexOf("email") >= 0) {
            this.registType = this.registType + "/邮箱";
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.loginAllocation !== nextProps.loginAllocation) {
            const registWay = nextProps.loginAllocation.registWay;
            this.setState({registWay});
            if (registWay === "account") {
                this.registType = "用户名";
            } else if (registWay === "phone") {
                this.registType = "电话号码";
            } else {
                this.registType = "邮箱";
            }
        }
    }

    getLoginCaptcha = () => {
        Api.getLoginCaptcha().then(blob => {
            let url = URL.createObjectURL(blob);
            this.setState({
                imgSrc: url
            });
        });
    };
    //   //确认密码输入
    //   handleConfirmBlur = e => {
    //     const value = e.target.value;
    //     this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    //   };
    //   validateToNextPassword = (rule, value, callback) => {
    //     const form = this.props.form;
    //     let password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_~!@#$]{8,18}$/;
    //     if (!password.test(value)) {
    //       callback("密码为八到十八位数字加字母的组合");
    //     } else if (value && this.state.confirmDirty) {
    //       form.validateFields(["confirm"], { force: true });
    //       callback();
    //     }
    //   };
    //   compareToFirstPassword = (rule, value, callback) => {
    //     const form = this.props.form;

    //     if (value && value !== form.getFieldValue("password")) {
    //       callback("两次密码不一致!");
    //     } else {
    //       callback();
    //     }
    //   };
    validateUsercode = (rule, value, callback) => {
        let registWayArray = this.state.registWay.split("_");
        const email = /^\w+\@\w+\.[a-z]+$/;
        const tel = /^((0\d{2,3}-\d{7,8})|(1[345789]\d{9}))$/;
        let validate = 0;
        if (registWayArray.indexOf("email") >= 0) {
            const email = /^\w+\@\w+\.[a-z]+$/;
            if (!value) {
                return callback(`请输入邮箱`);
            } else if (!email.test(value)) {
                validate++;
            }
        }
        if (registWayArray.indexOf("phone") >= 0) {
            if (!value) {
                return callback(`请输入电话号码`);
            } else if (!tel.test(value)) {
                validate++;
            }
        }
        if (registWayArray.indexOf("account") >= 0) {
            if (value.length<=0) {
              return  callback(`请输入${this.registType}`);
            }
        }
        if (validate >= registWayArray.length) {
            callback(`请输入${this.registType}`);
        } else {
            callback();
        }
    };
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                Api.register(values)
                    .then(res => {
                        if (res.status === "1") {
                            message.success(res.message);
                            this.props.isRegister(false);
                        }
                    })
                    .catch(err => {
                        this.getLoginCaptcha();
                        this.props.form.setFieldsValue({
                            usercode: "",
                            randomPassword: "",
                            captcha: ""
                        });
                        message.error(err.message);
                        this.setState({
                            isclo: true
                        });
                    });
            } else {
            }
        });
    };

    turn() {
        this.props.forget(true);
        this.props.form.setFieldsValue({
            usercode: "",
            randomPassword: "",
            captcha: ""
        });
    }

    register() {
        this.props.isRegister(false);
    }

    getTelCaptcha(e) {
        e.preventDefault();
        const _this = this;
        let tel = _this.props.form.getFieldValue("usercode");
        this.setState({
            isclo: false
        });
        if (tel === undefined) {
        } else {
            Api.sendRandomCaptcha({usercode: tel, type: 2})
                .then(res => {
                    message.success(res.message);
                    // 发送验证码成功
                    // 显示60s倒计时
                    const timer = setInterval(() => {
                        _this.setState(
                            preState => {
                                return {
                                    seconds: preState.seconds - 1,
                                    tipTxt: `${_this.state.seconds}s后`
                                };
                            },
                            () => {
                                if (_this.state.seconds < 0 || this.state.isclo === true) {
                                    clearInterval(timer);
                                    _this.setState({
                                        seconds: 60,
                                        tipTxt: "点击获取验证码"
                                    });
                                }
                            }
                        );
                    }, 1000);
                })
                .catch(res => {
                    message.error(res.message);
                });
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        console.log(this.state.loginWay);
        return (
            <Row className="login-box">
                <Row className={'login-box-title'}>用户注册 / Sign up</Row>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {getFieldDecorator("usercode", {
                            rules: [{validator: this.validateUsercode}]
                        })(
                            <Input
                                prefix={
                                    <Icon type="user" style={{color: "rgba(0,0,0,.25)"}}/>
                                }
                                placeholder={`请输入${this.registType}`}
                            />
                        )}
                    </FormItem>
                    {/* <FormItem>
            {getFieldDecorator("password", {
              rules: [
                { required: true, message: "输入密码 " },
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="请输入密码,8-18位数字加字母的组合"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator("rePassword", {
              rules: [
                { required: true, message: "确认密码!" },
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="请输入和上面相同的密码"
                onBlur={this.handleConfirmBlur}
              />
            )}
          </FormItem> */}
                    <FormItem>
                        <div className="flex-cap-id">
                            <div>
                                {getFieldDecorator("randomPassword", {
                                    rules: [{required: true, message: "输入验证码"}]
                                })(
                                    <Input
                                        placeholder="请输入验证码"
                                        prefix={
                                            <Icon type="mail" style={{color: "rgba(0,0,0,.25)"}}/>
                                        }
                                    />
                                )}
                            </div>
                            <div>
                                {this.state.seconds == 60 ? (
                                    <Button onClick={e => this.getTelCaptcha(e)}>
                                        点击获取验证码
                                    </Button>
                                ) : (
                                    <Button
                                        style={{
                                            height: "40px",
                                            // background: "#484988",
                                            // border: "1px solid #484988",
                                            color: "#9f9ea7"
                                        }}
                                    >
                                        {" "}
                                        {this.state.tipTxt}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </FormItem>
                    <FormItem>
                        <div className="kaptchald-div">
                            <div className='kaptchald-div-input'>
                                {getFieldDecorator("captcha", {
                                    rules: [{required: true, message: "请输入验证码"}]
                                })(
                                    <Input
                                        placeholder="不区分大小写,点击图片可刷新"
                                        prefix={
                                            <Icon
                                                type="safety-certificate"
                                                style={{color: "rgba(0,0,0,.25)"}}
                                            />
                                        }
                                    />
                                )}
                            </div>
                            <div className='kaptchald-div-img'>
                                <img src={this.state.imgSrc} onClick={() => this.getLoginCaptcha()}/>
                            </div>
                        </div>
                    </FormItem>
                    <FormItem>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                        >
                            注册
                        </Button>
                        <Row style={{textAlign: "right"}}><span onClick={() => this.props.toLogin()}>立即登录</span></Row>
                    </FormItem>
                </Form>
            </Row>
        );
    }
}

const RegisterWrapper = Form.create()(Register);

const mapStateToProps = state => {
    const {loginReducer, loginAllocation} = state;
    return {loginReducer, loginAllocation};
};
export default connect(mapStateToProps)(RegisterWrapper);
